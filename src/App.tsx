import React, { useState, useEffect } from 'react';
import { initialProjectState } from './data/initialProjectPlan';
import { 
  ProjectState, 
  ProjectTask, 
  TaskStatus, 
  ArchitectureChoice, 
  NetworkMatrixEntry,
  AiAnalysisResult 
} from './types';
import { Navbar } from './components/Navbar';
import { DynamicPlanView } from './components/DynamicPlanView';
import { NetworkMatrixView } from './components/NetworkMatrixView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { EvidenceLockerView } from './components/EvidenceLockerView';
import { ExecutiveReportView } from './components/ExecutiveReportView';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ByokModal } from './components/ByokModal';
import { 
  fetchWithByok, 
  hasStoredApiKey, 
  registerByokModalListener 
} from './services/aiClient';

const LOCAL_STORAGE_KEY = 'tanzu_hci_project_state_v4';

export default function App() {
  const [projectState, setProjectState] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved project state:', e);
    }
    return initialProjectState;
  });

  const [activeTab, setActiveTab] = useState<'plan' | 'diagram' | 'matrix' | 'advisor' | 'locker' | 'report'>('plan');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // BYOK State & Listener
  const [isByokModalOpen, setIsByokModalOpen] = useState<boolean>(false);
  const [byokModalError, setByokModalError] = useState<string | null>(null);
  const [hasAiKey, setHasAiKey] = useState<boolean>(hasStoredApiKey());

  useEffect(() => {
    const unregister = registerByokModalListener((payload) => {
      setByokModalError(payload?.errorMessage || null);
      setIsByokModalOpen(true);
    });

    const handleKeyChange = () => setHasAiKey(hasStoredApiKey());
    window.addEventListener('gemini_api_key_updated', handleKeyChange);

    return () => {
      unregister();
      window.removeEventListener('gemini_api_key_updated', handleKeyChange);
    };
  }, []);

  const handleUpdateClientName = (name: string) => {
    setProjectState(prev => ({
      ...prev,
      clientName: name,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'plan_adapted',
          message: `Nombre de cliente establecido a: ${name || 'Sin registrar'}`,
          author: 'Usuario'
        },
        ...prev.auditLogs
      ]
    }));
  };

  const handleUpdateClusterName = (name: string) => {
    setProjectState(prev => ({
      ...prev,
      clusterName: name,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'plan_adapted',
          message: `Nombre de clúster establecido a: ${name || 'Sin definir'}`,
          author: 'Usuario'
        },
        ...prev.auditLogs
      ]
    }));
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectState));
    } catch (e) {
      console.warn('Could not save project state:', e);
    }
  }, [projectState]);

  // Keep selectedTask in sync with projectState updates
  useEffect(() => {
    if (selectedTask) {
      const allTasks = projectState.phases.flatMap(p => p.tasks);
      const updated = allTasks.find(t => t.id === selectedTask.id);
      if (updated) {
        setSelectedTask(updated);
      }
    }
  }, [projectState]);

  const showNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleResetProject = () => {
    if (window.confirm('¿Deseas reiniciar el plan de proyecto a su estado inicial?')) {
      setProjectState(initialProjectState);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      showNotification('Plan de proyecto reiniciado a su configuración inicial.', 'info');
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setProjectState(prev => {
      const updatedPhases = prev.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
          }
          return task;
        })
      }));
      return {
        ...prev,
        phases: updatedPhases,
        lastUpdated: new Date().toISOString()
      };
    });
    showNotification(`Tarea ${taskId} actualizada a estado: ${newStatus}`, 'success');
  };

  const handleSubmitEvidence = async (taskId: string, evidenceContent: string): Promise<AiAnalysisResult | null> => {
    // Interceptor: if no API key is present in localStorage, halt and open the BYOK modal
    if (!hasStoredApiKey()) {
      setByokModalError('Para analizar evidencias técnicas con IA debes ingresar tu Google Gemini API Key.');
      setIsByokModalOpen(true);
      return null;
    }

    try {
      const targetTask = projectState.phases.flatMap(p => p.tasks).find(t => t.id === taskId);

      // Call backend AI analysis endpoint with BYOK authorization header
      const result = await fetchWithByok<AiAnalysisResult>('/api/analyze-evidence', {
        taskId,
        taskTitle: targetTask?.title || taskId,
        requiredEvidence: targetTask?.requiredEvidence || '',
        evidenceText: evidenceContent,
        currentArchitecture: projectState.networkArchitecture,
      });

      setProjectState(prev => {
        let newArchitecture = prev.networkArchitecture;
        if (result.detectedArchitecture && result.detectedArchitecture !== 'undetermined') {
          newArchitecture = result.detectedArchitecture;
        }

        // Apply any specific plan modifications returned by the AI
        const updatedPhases = prev.phases.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                status: (result.verdict === 'pass' ? 'completed' : task.status) as TaskStatus,
                evidence: {
                  id: `ev_${Date.now()}`,
                  taskId,
                  type: 'text_log' as const,
                  content: evidenceContent,
                  submittedBy: 'Ingeniero de Implementación',
                  submittedAt: new Date().toISOString(),
                  notes: `Veredicto IA: ${result.verdict}`
                },
                aiAnalysis: result,
                updatedAt: new Date().toISOString()
              };
            }

            // Check if this task has specific modifications in the AI result
            if (result.planModifications) {
              const mod = result.planModifications.find(m => m.targetTaskId === task.id);
              if (mod) {
                let derivedStatus = task.status;
                if (mod.action === 'activate' && (task.status === 'skipped' || task.status === 'pending')) {
                  derivedStatus = 'pending';
                } else if (mod.action === 'skip') {
                  derivedStatus = 'skipped';
                }

                return {
                  ...task,
                  status: derivedStatus,
                  conditionNote: mod.note || task.conditionNote,
                  updatedAt: new Date().toISOString()
                };
              }
            }

            return task;
          })
        }));

        return {
          ...prev,
          networkArchitecture: newArchitecture,
          phases: updatedPhases,
          lastUpdated: new Date().toISOString()
        };
      });

      showNotification(`Evidencia analizada por IA. Veredicto: ${result.verdict.toUpperCase()}`, 'success');
      return result;
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      if (error?.message !== 'API_KEY_REQUIRED' && error?.message !== 'INVALID_API_KEY') {
        showNotification(error?.message || 'Error al analizar la evidencia con IA.', 'warning');
      }
      return null;
    }
  };

  const handleQuickSimulate = async (scenario: 'avi_vds' | 'nsx') => {
    const t131 = projectState.phases.flatMap(p => p.tasks).find(t => t.id === '1.3.1');
    if (!t131) return;

    let sampleContent = '';
    if (scenario === 'avi_vds') {
      sampleContent = `[PowerCLI] Get-View ExtensionManager
Key                     Version
---                     -------
com.vmware.vim.vcha     8.0.2.0
com.vmware.rbd          8.0.2.0
com.simplivity.plugin   5.0.1.42

Result: No se encontró extensión com.vmware.nsx en vCenter. La infraestructura opera sobre VDS estándar. Se requiere balanceador L4/L7 independiente.`;
    } else {
      sampleContent = `[PowerCLI] Get-View ExtensionManager | Select -ExpandProperty ExtensionList
Key                     Version
---                     -------
com.vmware.nsx.management 4.1.2.0
com.simplivity.plugin   5.0.1.42

NSX Manager IP: 10.100.10.80. Clúster NSX-T activo y saludable con Geneve Overlays y Edge Cluster configurado.`;
    }

    if (hasStoredApiKey()) {
      await handleSubmitEvidence('1.3.1', sampleContent);
    } else {
      // Deterministic immediate branch simulation when no API key is yet configured
      setProjectState(prev => {
        const isAvi = scenario === 'avi_vds';
        const updatedPhases = prev.phases.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === '1.3.1') {
              return {
                ...task,
                status: 'completed' as TaskStatus,
                evidence: {
                  id: `ev_${Date.now()}`,
                  taskId: '1.3.1',
                  type: 'text_log' as const,
                  content: sampleContent,
                  submittedBy: 'Simulación Técnica',
                  submittedAt: new Date().toISOString(),
                  notes: `Bifurcación: ${isAvi ? 'Opción B (Avi sobre VDS)' : 'Opción A (NSX Nativo)'}`
                },
                updatedAt: new Date().toISOString()
              };
            }
            if (task.id === '0.5') {
              return {
                ...task,
                status: isAvi ? ('pending' as TaskStatus) : ('skipped' as TaskStatus),
                conditionNote: isAvi ? 'Obligatoria: Se requiere Avi Controller para balanceo en VDS.' : 'Omitida: NSX proveerá balanceo nativo.',
                updatedAt: new Date().toISOString()
              };
            }
            return task;
          })
        }));

        return {
          ...prev,
          networkArchitecture: scenario,
          phases: updatedPhases,
          lastUpdated: new Date().toISOString()
        };
      });

      showNotification(
        scenario === 'avi_vds' 
          ? 'Simulación aplicada: Sin NSX -> Opción B (Avi LB) activada en todo el plan.' 
          : 'Simulación aplicada: NSX-T detectado -> Opción A activada en todo el plan.',
        'info'
      );
    }
  };

  const handleUpdateMatrix = (newMatrix: NetworkMatrixEntry[]) => {
    setProjectState(prev => ({
      ...prev,
      networkMatrix: newMatrix,
      lastUpdated: new Date().toISOString()
    }));
    showNotification('Matriz de red actualizada con éxito.', 'success');
  };

  // Metrics
  const allTasks = projectState.phases.flatMap(p => p.tasks);
  const completedCount = allTasks.filter(t => t.status === 'completed').length;
  const totalCount = allTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        networkArchitecture={projectState.networkArchitecture}
        progressPercent={progressPercent}
        completedTasks={completedCount}
        totalTasks={totalCount}
        clientName={projectState.clientName}
        clusterName={projectState.clusterName}
        hasAiKey={hasAiKey}
        onOpenByokModal={() => setIsByokModalOpen(true)}
        onUpdateClientName={handleUpdateClientName}
        onUpdateClusterName={handleUpdateClusterName}
        onResetProject={handleResetProject}
        onQuickSimulate={handleQuickSimulate}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : notification.type === 'warning'
              ? 'bg-amber-950 border-amber-700 text-amber-200'
              : 'bg-cyan-950 border-cyan-700 text-cyan-200'
          }`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'plan' && (
          <DynamicPlanView
            phases={projectState.phases}
            networkArchitecture={projectState.networkArchitecture}
            onSelectTask={(task) => setSelectedTask(task)}
            onQuickSimulate={handleQuickSimulate}
          />
        )}

        {activeTab === 'diagram' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Topología 100% Real Sincronizada
                  </span>
                  <span className="text-xs text-slate-400">Vinculada en vivo con las tareas del proyecto</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                  Diagrama Arquitectónico de la Solución Tanzu sobre SimpliVity
                </h2>
                <p className="text-xs text-slate-400">
                  Haz clic en cualquier componente para ver o ejecutar la tarea del plan técnico que lo valida.
                </p>
              </div>
            </div>

            <ArchitectureDiagram
              projectState={projectState}
              onSelectTaskById={(taskId) => {
                const task = allTasks.find(t => t.id === taskId);
                if (task) setSelectedTask(task);
              }}
            />
          </div>
        )}

        {activeTab === 'matrix' && (
          <NetworkMatrixView
            networkMatrix={projectState.networkMatrix}
            onUpdateMatrix={handleUpdateMatrix}
            networkArchitecture={projectState.networkArchitecture}
          />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorView
            networkArchitecture={projectState.networkArchitecture}
            completedTasksCount={completedCount}
            totalTasksCount={totalCount}
            onOpenByokModal={() => setIsByokModalOpen(true)}
          />
        )}

        {activeTab === 'locker' && (
          <EvidenceLockerView
            phases={projectState.phases}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {activeTab === 'report' && (
          <ExecutiveReportView
            projectState={projectState}
            onSelectTaskById={(taskId) => {
              const task = allTasks.find(t => t.id === taskId);
              if (task) setSelectedTask(task);
            }}
            onOpenByokModal={() => setIsByokModalOpen(true)}
          />
        )}
      </main>

      {/* Task Execution Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateTaskStatus}
          onSubmitEvidence={handleSubmitEvidence}
          currentArchitecture={projectState.networkArchitecture}
        />
      )}

      {/* BYOK Configuration Modal */}
      <ByokModal
        isOpen={isByokModalOpen}
        onClose={() => setIsByokModalOpen(false)}
        initialError={byokModalError}
        onKeySaved={() => {
          setHasAiKey(true);
          showNotification('¡Google Gemini API Key activada con éxito!', 'success');
        }}
      />
    </div>
  );
}
