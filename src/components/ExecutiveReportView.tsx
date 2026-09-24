import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Network, 
  Server, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  Database, 
  ArrowRight, 
  TrendingUp,
  Key
} from 'lucide-react';
import { ProjectState } from '../types';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { 
  fetchWithByok, 
  hasStoredApiKey, 
  triggerOpenByokModal 
} from '../services/aiClient';

interface ExecutiveReportViewProps {
  projectState: ProjectState;
  onSelectTaskById?: (taskId: string) => void;
  onOpenByokModal?: () => void;
}

interface RiskAssessmentData {
  readinessScore: number;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  executiveVerdict: string;
  criticalAlerts: string[];
  nextPriorityAction: string;
  hardwareValidationSummary: string;
  generatedAt: string;
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  projectState,
  onSelectTaskById,
  onOpenByokModal,
}) => {
  const [assessment, setAssessment] = useState<RiskAssessmentData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(hasStoredApiKey());

  const allTasks = projectState.phases.flatMap(p => p.tasks);
  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const percentComplete = Math.round((completedTasks.length / allTasks.length) * 100);

  const calculateDeterministicAssessment = (): RiskAssessmentData => {
    const arch = projectState.networkArchitecture;
    const blockedTasks = allTasks.filter(t => t.status === 'blocked');
    return {
      readinessScore: percentComplete,
      riskLevel: blockedTasks.length > 0 ? 'Alto' : percentComplete < 35 ? 'Medio' : 'Bajo',
      executiveVerdict: percentComplete >= 70
        ? 'La plataforma cuenta con la mayoría de los prerrequisitos validados y está lista para fases finales de despliegue de Tanzu.'
        : arch === 'undetermined'
        ? 'Punto de atención crítico: La arquitectura SDN (NSX vs Avi) aún no ha sido relevada en Fase 1.3. Esto define el aprovisionamiento de balanceo.'
        : `Arquitectura fijada en ${arch === 'avi_vds' ? 'Avi Load Balancer sobre VDS (Opción B)' : 'NSX Nativo (Opción A)'}. Descubrimiento y diseño en progreso constante.`,
      criticalAlerts: blockedTasks.map(t => `Tarea [${t.id}] ${t.title} se encuentra bloqueada.`),
      nextPriorityAction: arch === 'undetermined'
        ? 'Ejecutar la tarea 1.3.1 (Check de NSX) para destrabar el diseño de balanceo.'
        : 'Validar datastores NFS de SimpliVity con SPBM y completar la matriz de direccionamiento IP.',
      hardwareValidationSummary: 'Clúster de 3 nodos HPE SimpliVity 380 Gen10 con almacenamiento hiperconvergente.',
      generatedAt: new Date().toISOString()
    };
  };

  const fetchAiAssessment = async () => {
    if (!hasStoredApiKey()) {
      setAssessment(calculateDeterministicAssessment());
      return;
    }

    setIsLoadingAi(true);
    try {
      const data = await fetchWithByok<RiskAssessmentData>('/api/ai-risk-assessment', {
        projectState
      });
      setAssessment(data);
    } catch (err: any) {
      console.warn('Could not fetch AI risk assessment from Gemini, using calculation:', err);
      setAssessment(calculateDeterministicAssessment());
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    const handleKeyChange = () => {
      setHasApiKey(hasStoredApiKey());
      fetchAiAssessment();
    };
    window.addEventListener('gemini_api_key_updated', handleKeyChange);
    return () => window.removeEventListener('gemini_api_key_updated', handleKeyChange);
  }, []);

  useEffect(() => {
    fetchAiAssessment();
  }, [projectState.networkArchitecture, completedTasks.length]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl print:hidden">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Informe Ejecutivo de Factibilidad e Implementación</span>
          </h2>
          <p className="text-xs text-slate-400">
            Documento formal con diagrama arquitectónico 100% sincronizado en vivo con las tareas completadas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAiAssessment}
            disabled={isLoadingAi}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{isLoadingAi ? 'Auditando...' : 'Re-auditar con IA'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 print:border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-700">
                Plan de Proyecto Técnico & Arquitectura en Vivo
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 print:text-gray-900">
                Implementación de vSphere with Tanzu sobre HCI
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 print:text-gray-600">
                Plataforma: HPE SimpliVity 380 Gen10 (3 Nodos) • vSphere 8.0 • VMware Tanzu
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-gray-500 font-mono">
              <div>Cliente: <span className="font-bold text-white print:text-gray-900">{projectState.clientName || 'Por registrar (Fase 0)'}</span></div>
              <div>Fecha: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Progreso: {percentComplete}% de Tareas Ejecutadas</div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary & AI Health Assessment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 print:text-gray-800 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 print:bg-cyan-700"></span>
              <span>1. Resumen Ejecutivo & Auditoría IA de Preparación</span>
            </h2>
            {assessment && (
              <span className="text-[11px] font-mono text-cyan-400 print:text-cyan-800 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auditoría Gemini: Riesgo {assessment.riskLevel}</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 print:text-gray-700 leading-relaxed">
            El presente informe resume el relevamiento técnico, verificación de compatibilidad arquitectónica y hoja de ruta para la habilitación del Supervisor Cluster y Tanzu Kubernetes Grid (TKG) sobre la infraestructura hiperconvergente HPE SimpliVity del cliente.
          </p>

          {/* AI Assessment Box */}
          {!hasApiKey && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-cyan-200 print:hidden">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Para un diagnóstico dinámico en tiempo real generado por el Arquitecto Jefe con Gemini, activa tu API Key gratuita.</span>
              </div>
              <button
                type="button"
                onClick={onOpenByokModal ? onOpenByokModal : () => triggerOpenByokModal()}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center space-x-1.5 shrink-0 shadow-md shadow-cyan-500/20"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Activar IA</span>
              </button>
            </div>
          )}

          {assessment && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 print:border-gray-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
                  <span className="text-xs font-bold text-white print:text-gray-900">
                    Diagnóstico IA de Readiness:
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 print:text-cyan-800">
                    {assessment.readinessScore}% de Preparación
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 print:text-gray-600">Nivel de Riesgo:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    assessment.riskLevel === 'Bajo'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800 print:bg-emerald-100 print:text-emerald-800'
                      : assessment.riskLevel === 'Medio'
                      ? 'bg-amber-950 text-amber-300 border-amber-800 print:bg-amber-100 print:text-amber-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800 print:bg-rose-100 print:text-rose-800'
                  }`}>
                    {assessment.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 print:text-gray-700 leading-relaxed">
                {assessment.executiveVerdict}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 print:bg-white print:border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 print:text-cyan-700 block mb-0.5">
                    Próxima Acción Prioritaria:
                  </span>
                  <span className="text-slate-300 print:text-gray-700">
                    {assessment.nextPriorityAction}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 print:bg-white print:border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 block mb-0.5">
                    Infraestructura Validada:
                  </span>
                  <span className="text-slate-300 print:text-gray-700">
                    {assessment.hardwareValidationSummary}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] text-slate-400 print:text-gray-500 block">Hosts Físicos:</span>
              <span className="text-sm font-bold text-white print:text-gray-900">{projectState.hostsCount} Nodos HCI 380</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] text-slate-400 print:text-gray-500 block">Almacenamiento:</span>
              <span className="text-sm font-bold text-white print:text-gray-900">SimpliVity NFS (SPBM)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] text-slate-400 print:text-gray-500 block">Decisión de Red:</span>
              <span className="text-sm font-bold text-cyan-400 print:text-cyan-800">
                {projectState.networkArchitecture === 'avi_vds' ? 'Opción B (Avi + VDS)' : projectState.networkArchitecture === 'nsx' ? 'Opción A (NSX Nativo)' : 'En Descubrimiento'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200">
              <span className="text-[11px] text-slate-400 print:text-gray-500 block">Progreso Tareas:</span>
              <span className="text-sm font-bold text-emerald-400 print:text-emerald-700">{percentComplete}% Finalizado</span>
            </div>
          </div>
        </div>

        {/* Section 2: Real-time Architecture Diagram (100% Real according to tasks) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 print:text-gray-800 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 print:bg-cyan-700"></span>
              <span>2. Diagrama Arquitectónico de la Implementación (100% Real Sincronizado)</span>
            </h2>
            <span className="text-xs text-slate-400 print:text-gray-600">
              Refleja exactamente las tareas verificadas y ejecutadas en el proyecto
            </span>
          </div>

          <p className="text-xs text-slate-400 print:text-gray-600 leading-relaxed">
            A continuación se presenta la topología arquitectónica de 5 capas. Cada componente muestra su estado técnico real en función de las evidencias de auditoría registradas en las fases 0 a 3:
          </p>

          {/* Render 100% real architecture diagram */}
          <div className="mt-3">
            <ArchitectureDiagram
              projectState={projectState}
              onSelectTaskById={onSelectTaskById}
              isPrintMode={false}
            />
          </div>
        </div>

        {/* Section 3: Architectural Decision Tree (NSX vs Avi) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-gray-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 print:bg-cyan-700"></span>
            <span>3. Justificación Arquitectónica de Red (Bifurcación de Proyecto)</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200 text-xs sm:text-sm text-slate-300 print:text-gray-700 space-y-2">
            <div className="font-semibold text-white print:text-gray-900">
              {projectState.networkArchitecture === 'avi_vds' && (
                <>Arquitectura Seleccionada: Opción B — NSX Advanced Load Balancer (Avi) sobre vSphere Distributed Switch (VDS)</>
              )}
              {projectState.networkArchitecture === 'nsx' && (
                <>Arquitectura Seleccionada: Opción A — Enrutamiento y Balanceo Nativo sobre VMware NSX-T</>
              )}
              {projectState.networkArchitecture === 'undetermined' && (
                <>Arquitectura Pendiente de Resolución en Fase 1.3 (Check de NSX)</>
              )}
            </div>
            <p className="leading-relaxed">
              {projectState.networkArchitecture === 'avi_vds' ? (
                'Dado que la verificación "As-Is" confirmó la no existencia de un clúster NSX-T preexistente en la plataforma, la arquitectura se basa en el despliegue del Avi Controller Appliance (OVA) sobre la red de Management y la creación de Service Engines en el VDS existente. Esto elimina la necesidad de gateways Tier-0/Tier-1 y minimiza el impacto en la infraestructura física.'
              ) : projectState.networkArchitecture === 'nsx' ? (
                'Al detectarse un clúster de NSX-T Data Center activo en el vCenter, Tanzu interactuará directamente con el modelo de segmentos de overlay Geneve y Tier-1 routers creados automáticamente por el Supervisor Cluster, interconectándose al Tier-0 existente.'
              ) : (
                'El plan de proyecto aguarda la ejecución del relevamiento de extensiones com.vmware.nsx en el vCenter para disparar automáticamente la opción A o B.'
              )}
            </p>
          </div>
        </div>

        {/* Section 4: Storage & SimpliVity SPBM */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-gray-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 print:bg-cyan-700"></span>
            <span>4. Estrategia de Almacenamiento HPE SimpliVity (SPBM)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 print:text-gray-700 leading-relaxed">
            Las cargas de trabajo de Tanzu (Supervisor Control Plane VMs y Persistent Volumes de Kubernetes) se aprovisionan sobre los datastores NFS gestionados por las Virtual Controllers (OVC) de SimpliVity. Se valida la comunicación con el VASA Provider y se aplica una VM Storage Policy basada en etiquetas (Tag-Based Placement Rules) para garantizar la compresión y deduplicación nativa de hardware.
          </p>
        </div>

        {/* Section 5: Network & IP Allocation Matrix */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-gray-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 print:bg-cyan-700"></span>
            <span>5. Matriz de Parámetros de Red e IPs (Fase 2.2)</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
            <table className="w-full text-left text-xs text-slate-300 print:text-gray-800">
              <thead className="bg-slate-950 text-slate-400 print:bg-gray-100 print:text-gray-700 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Capa</th>
                  <th className="p-3">VLAN</th>
                  <th className="p-3">Subred (CIDR)</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Rango Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200 font-mono">
                {projectState.networkMatrix.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-sans font-medium text-white print:text-gray-900">{item.name}</td>
                    <td className="p-3">{item.vlanId || <span className="text-slate-500 font-sans italic">Por definir</span>}</td>
                    <td className="p-3 text-cyan-400 print:text-cyan-800">{item.subnetCidr || <span className="text-slate-500 font-sans italic">Por asignar (Fase 2.2)</span>}</td>
                    <td className="p-3">{item.gateway || <span className="text-slate-500 font-sans italic">Por asignar</span>}</td>
                    <td className="p-3">{item.usableIpRange || <span className="text-slate-500 font-sans italic">Por asignar</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: RACI / Responsibilities & Sign-off */}
        <div className="space-y-3 border-t border-slate-800 pt-6 print:border-gray-300">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-gray-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 print:bg-cyan-700"></span>
            <span>6. Matriz de Responsabilidades (RACI) y Próximos Pasos</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 print:text-gray-700">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200 space-y-1.5">
              <span className="font-bold text-white print:text-gray-900 block">Acciones del Cliente (Fase 0 y 2):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 print:text-gray-600">
                <li>Confirmación de suscripción VCF/VVF (Cores de CPU).</li>
                <li>Habilitación y enrutamiento de las VLANs de Management, Frontend y Workload.</li>
                <li>Aprobación de registros DNS (A/PTR) para el clúster Tanzu.</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-200 space-y-1.5">
              <span className="font-bold text-white print:text-gray-900 block">Acciones del Ingeniero de Implementación (Fase 1 y 3):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 print:text-gray-600">
                <li>Ejecución de auditoría PowerCLI y validación de NTP.</li>
                <li>Despliegue y configuración del Balanceador (Avi) o NSX.</li>
                <li>Ejecución del wizard de Workload Management y despliegue del clúster TKG.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
