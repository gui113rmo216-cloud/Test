import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Terminal, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check 
} from 'lucide-react';
import { ProjectPhase, ProjectTask } from '../types';

interface EvidenceLockerViewProps {
  phases: ProjectPhase[];
  onSelectTask: (task: ProjectTask) => void;
}

export const EvidenceLockerView: React.FC<EvidenceLockerViewProps> = ({
  phases,
  onSelectTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allTasks = phases.flatMap(p => p.tasks);
  const tasksWithEvidence = allTasks.filter(t => !!t.evidence || !!t.aiAnalysis);

  const handleCopyEvidence = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTasks = tasksWithEvidence.filter(task => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      task.id.toLowerCase().includes(q) ||
      task.title.toLowerCase().includes(q) ||
      task.evidence?.content.toLowerCase().includes(q) ||
      task.aiAnalysis?.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Bóveda de Evidencias & Registro de Auditoría
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Repositorio centralizado de salidas de consola, capturas de pantalla y veredictos de validación emitidos por el motor de IA para el proyecto.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            {tasksWithEvidence.length} registros auditados
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar en evidencia, logs o veredictos de IA..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Grid of Evidence Cards */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No hay evidencias registradas aún</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Abre cualquier tarea del Plan Dinámico (como la 1.3.1 Check de NSX o 1.1.1 ESXi), pega la salida de consola o aplica una muestra de prueba y ejecútala.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Tarea {task.id}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {task.title}
                  </h4>
                </div>

                <div className="flex items-center space-x-2">
                  {task.aiAnalysis && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      task.aiAnalysis.verdict === 'pass'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {task.aiAnalysis.verdict === 'pass' ? 'Veredicto: Aprobado' : 'Veredicto: Advertencia'}
                    </span>
                  )}
                  <button
                    onClick={() => onSelectTask(task)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>

              {/* Submitted Content Snippet */}
              {task.evidence && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-hidden space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salida registrada ({new Date(task.evidence.submittedAt).toLocaleString()}):</span>
                    </span>
                    <button
                      onClick={() => handleCopyEvidence(task.evidence?.content || '', task.id)}
                      className="text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedId === task.id ? (
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
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {task.evidence.content}
                  </pre>
                </div>
              )}

              {/* AI Analysis Summary */}
              {task.aiAnalysis && (
                <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evaluación por IA:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {task.aiAnalysis.summary}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
