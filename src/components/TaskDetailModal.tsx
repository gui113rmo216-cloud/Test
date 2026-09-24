import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Key
} from 'lucide-react';
import { ProjectTask, TaskStatus, AiAnalysisResult } from '../types';
import { fetchWithByok, hasStoredApiKey, triggerOpenByokModal } from '../services/aiClient';

interface TaskDetailModalProps {
  task: ProjectTask;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onSubmitEvidence: (taskId: string, content: string) => Promise<AiAnalysisResult | null>;
  currentArchitecture: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onSubmitEvidence,
  currentArchitecture,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [evidenceInput, setEvidenceInput] = useState<string>(task.evidence?.content || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(-1);
  const [taskAiTip, setTaskAiTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState<boolean>(false);

  const handleFetchTaskAdvice = async () => {
    if (!hasStoredApiKey()) {
      triggerOpenByokModal({
        errorMessage: 'Para consultar recomendaciones con IA debes ingresar tu Google Gemini API Key.',
      });
      return;
    }

    setIsLoadingTip(true);
    try {
      const data = await fetchWithByok<{ reply: string }>('/api/advisor-chat', {
        message: `¿Cuáles son las recomendaciones técnicas, riesgos y verificaciones clave para ejecutar la tarea "${task.id}: ${task.title}" en un clúster HPE SimpliVity 380 con vSphere with Tanzu?`,
        projectContext: {
          networkArchitecture: currentArchitecture,
          lastDecision: `Evaluando tarea ${task.id}`
        }
      });
      setTaskAiTip(data.reply);
    } catch (e: any) {
      console.error('Error getting task advice:', e);
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleCopyCommand = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplySample = (index: number) => {
    if (task.sampleEvidence && task.sampleEvidence[index]) {
      setEvidenceInput(task.sampleEvidence[index].content);
      setSelectedSampleIndex(index);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!evidenceInput.trim()) return;
    setIsAnalyzing(true);
    try {
      await onSubmitEvidence(task.id, evidenceInput);
    } catch (error) {
      console.error('Error analyzing evidence:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completada
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center text-xs font-medium text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> En Progreso
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center text-xs font-medium text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Bloqueada
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            Omitida (No requerida)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800">
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Tarea {task.id}
              </span>
              <span className="text-xs text-slate-400">{task.subCategory}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Responsable: <strong className="text-slate-200">{task.role}</strong></span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {task.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {getStatusBadge(task.status)}
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* Conditional banner if task is critical fork */}
          {task.isConditional && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border border-amber-800/60 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Tarea Condicional / Punto de Decisión IA
                </h4>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  {task.conditionNote || 'Esta tarea modifica dinámicamente las fases subsiguientes del plan de implementación según la evidencia suministrada.'}
                </p>
              </div>
            </div>
          )}

          {/* Description & Objective */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Descripción del Paso
            </h3>
            <p className="text-slate-200 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Step-by-Step Execution Guide */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Instrucciones Detalladas de Ejecución</span>
            </h3>
            <ol className="space-y-2">
              {task.executionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/70">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 leading-normal">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Technical Commands Box (PowerCLI / SSH / Bash) */}
          {task.commands && task.commands.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Comandos de Solo Lectura / Ejecución</span>
              </h3>
              <div className="space-y-3">
                {task.commands.map((cmd, idx) => (
                  <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-slate-400 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{cmd.label}</span>
                      </span>
                      <button
                        onClick={() => handleCopyCommand(cmd.command, idx)}
                        className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-800 transition"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 overflow-x-auto">
                      <code className="text-xs font-mono text-emerald-300 whitespace-pre">
                        {cmd.command}
                      </code>
                    </div>
                    {cmd.explanation && (
                      <div className="px-3 py-1.5 bg-slate-900/50 border-t border-slate-800 text-[11px] text-slate-400">
                        {cmd.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GUI Breadcrumb & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.guiBreadcrumb && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  Ubicación en Consola / vSphere Client:
                </span>
                <span className="text-xs font-mono text-cyan-300">
                  {task.guiBreadcrumb}
                </span>
              </div>
            )}

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Resultado Esperado (Validación):
              </span>
              <span className="text-xs text-slate-300">
                {task.expectedResult}
              </span>
            </div>
          </div>

          {task.warnings && task.warnings.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Advertencias Críticas:</span>
              </span>
              <ul className="list-disc list-inside text-xs text-amber-200/90 space-y-0.5">
                {task.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Task-Specific AI Advisor */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Asistente Técnico IA para esta Tarea</span>
              </span>
              <button
                type="button"
                onClick={handleFetchTaskAdvice}
                disabled={isLoadingTip}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-md border border-slate-700 flex items-center space-x-1 transition font-medium"
              >
                <Sparkles className={`w-3 h-3 ${isLoadingTip ? 'animate-spin' : ''}`} />
                <span>{isLoadingTip ? 'Consultando IA...' : 'Pedir Recomendaciones Técnicas'}</span>
              </button>
            </div>
            {taskAiTip && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed mt-2 animate-fadeIn">
                {taskAiTip}
              </div>
            )}
          </div>

          {/* Evidence Collection & AI Validation Section */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Evidencia Requerida & Análisis de IA</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {task.requiredEvidence}
                </p>
              </div>

              {/* Sample evidence picker */}
              {task.sampleEvidence && task.sampleEvidence.length > 0 && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-slate-400">Muestra rápida:</span>
                  {task.sampleEvidence.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySample(idx)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition font-medium ${
                        selectedSampleIndex === idx
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Textarea */}
            <div>
              <textarea
                id="evidence-input"
                rows={5}
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Pegue aquí la salida de la consola (PowerCLI, SSH, log) o describa la evidencia obtenida..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
              />
            </div>

            {/* Action Bar: Analyze with AI */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                id="btn-analyze-ai"
                onClick={handleRunAiAnalysis}
                disabled={!evidenceInput.trim() || isAnalyzing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : 'text-cyan-200'}`} />
                <span>{isAnalyzing ? 'Analizando evidencia con IA...' : 'Analizar Evidencia con IA y Adaptar Plan'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Estado manual:</span>
                <select
                  id="select-task-status"
                  value={task.status}
                  onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completada</option>
                  <option value="blocked">Bloqueada</option>
                  <option value="skipped">Omitida</option>
                </select>
              </div>
            </div>

            {/* AI Analysis Verdict Presentation */}
            {task.aiAnalysis && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Veredicto de Evaluación por IA
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    task.aiAnalysis.verdict === 'pass'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : task.aiAnalysis.verdict === 'warning'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {task.aiAnalysis.verdict === 'pass' ? 'CUMPLE PRERREQUISITOS' : task.aiAnalysis.verdict === 'warning' ? 'ADVERTENCIA' : 'NO CONFORME'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {task.aiAnalysis.summary}
                </p>

                {task.aiAnalysis.technicalFindings && task.aiAnalysis.technicalFindings.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Hallazgos Técnicos Clave:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                      {task.aiAnalysis.technicalFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {task.aiAnalysis.planModifications && task.aiAnalysis.planModifications.length > 0 && (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60">
                    <span className="text-[11px] font-bold uppercase text-cyan-300 flex items-center space-x-1 mb-1.5">
                      <ArrowRight className="w-3 h-3" />
                      <span>Adaptación Automática del Plan Ejecutada:</span>
                    </span>
                    <div className="space-y-1">
                      {task.aiAnalysis.planModifications.map((mod, idx) => (
                        <div key={idx} className="text-xs text-cyan-200/90 flex items-start space-x-1.5">
                          <span className="font-mono font-bold text-cyan-400">[{mod.targetTaskId}]:</span>
                          <span>{mod.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Última actualización: {task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString() : 'No editada'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateStatus(task.id, 'completed')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar Completada</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
