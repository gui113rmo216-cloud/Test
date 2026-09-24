import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight, 
  Terminal, 
  ShieldCheck, 
  Search, 
  Filter, 
  Layers, 
  User, 
  ArrowRight,
  Info,
  Network
} from 'lucide-react';
import { ProjectPhase, ProjectTask, TaskStatus, TaskRole, ArchitectureChoice } from '../types';

interface DynamicPlanViewProps {
  phases: ProjectPhase[];
  networkArchitecture: ArchitectureChoice;
  onSelectTask: (task: ProjectTask) => void;
  onQuickSimulate: (scenario: 'avi_vds' | 'nsx') => void;
}

export const DynamicPlanView: React.FC<DynamicPlanViewProps> = ({
  phases,
  networkArchitecture,
  onSelectTask,
  onQuickSimulate,
}) => {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allTasks = phases.flatMap(p => p.tasks);

  const filteredTasks = allTasks.filter(task => {
    if (selectedPhaseFilter !== 'all' && task.phaseId !== selectedPhaseFilter) return false;
    if (selectedRoleFilter !== 'all' && task.role !== selectedRoleFilter) return false;
    if (selectedStatusFilter !== 'all') {
      if (selectedStatusFilter === 'conditional' && !task.isConditional) return false;
      if (selectedStatusFilter !== 'conditional' && task.status !== selectedStatusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.id.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.subCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic AI Architecture Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Motor de Plan Dinámico & Adaptación por Evidencia
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {networkArchitecture === 'undetermined' ? 'En Descubrimiento' : 'Adaptado'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {networkArchitecture === 'undetermined' && (
                  <>
                    La arquitectura de red se encuentra en etapa de relevamiento. La tarea{' '}
                    <strong className="text-cyan-400 font-semibold cursor-pointer underline" onClick={() => {
                      const t131 = allTasks.find(t => t.id === '1.3.1');
                      if (t131) onSelectTask(t131);
                    }}>
                      1.3.1 (Check de NSX)
                    </strong>{' '}
                    es el punto de decisión que bifurcará el plan entre{' '}
                    <span className="text-indigo-300">Opción A (NSX-T)</span> y{' '}
                    <span className="text-teal-300">Opción B (Avi Load Balancer sobre VDS)</span>.
                  </>
                )}
                {networkArchitecture === 'avi_vds' && (
                  <>
                    <strong className="text-teal-300 font-semibold">Opción B Activada (Avi LB sobre VDS):</strong>{' '}
                    Al no detectarse NSX en el descubrimiento, el plan ha activado la tarea{' '}
                    <strong className="text-cyan-400">0.5 (Descarga obligatoria de Avi Controller)</strong>, la rama de diseño{' '}
                    <strong className="text-cyan-400">2.1(B)</strong> y el despliegue de balanceador en{' '}
                    <strong className="text-cyan-400">3.1(B)</strong>.
                  </>
                )}
                {networkArchitecture === 'nsx' && (
                  <>
                    <strong className="text-indigo-300 font-semibold">Opción A Activada (NSX-T Nativo):</strong>{' '}
                    Se detectó clúster NSX-T. El plan omitió la descarga de Avi (Tarea 0.5) y configuró las fases 2.1 y 3.1 para operar con Tier-0/Tier-1 Gateways e IP Pools nativos.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick interactive test buttons */}
          <div className="flex items-center space-x-2 shrink-0 self-start lg:self-center">
            <span className="text-xs text-slate-400 hidden sm:inline">Probar ramificación:</span>
            <button
              onClick={() => onQuickSimulate('avi_vds')}
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center space-x-1.5 ${
                networkArchitecture === 'avi_vds'
                  ? 'bg-teal-950 text-teal-300 border-teal-700 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-teal-400" />
              <span>Forzar Opción B (Avi)</span>
            </button>
            <button
              onClick={() => onQuickSimulate('nsx')}
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center space-x-1.5 ${
                networkArchitecture === 'nsx'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span>Forzar Opción A (NSX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Phase Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium px-1">Fase:</span>
            <select
              value={selectedPhaseFilter}
              onChange={(e) => setSelectedPhaseFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas las Fases (0 - 3)</option>
              <option value="phase_0">Fase 0: Preparación</option>
              <option value="phase_1">Fase 1: Descubrimiento As-Is</option>
              <option value="phase_2">Fase 2: Diseño To-Be</option>
              <option value="phase_3">Fase 3: Ejecución</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium px-1">Rol:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los Roles</option>
              <option value="Cliente">Cliente</option>
              <option value="Ingeniero de Implementación">Ingeniero de Implementación</option>
              <option value="IA / Arquitecto">IA / Arquitecto</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium px-1">Estado:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completadas</option>
              <option value="conditional">Condicionales (IA)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, título, comando..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Phase Sections & Task List */}
      <div className="space-y-6">
        {phases.map((phase) => {
          // If filtering by specific phase and it doesn't match, skip
          if (selectedPhaseFilter !== 'all' && phase.id !== selectedPhaseFilter) {
            return null;
          }

          const phaseTasks = phase.tasks.filter(t => filteredTasks.includes(t));
          if (phaseTasks.length === 0 && (selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all' || searchQuery.trim())) {
            return null;
          }

          const completedCount = phase.tasks.filter(t => t.status === 'completed').length;
          const totalCount = phase.tasks.length;
          const percent = Math.round((completedCount / totalCount) * 100);

          return (
            <div 
              key={phase.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Phase Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      FASE {phase.number}
                    </span>
                    <span className="text-xs text-slate-400">
                      Rol Predeterminado: <strong className="text-slate-300">{phase.defaultRole}</strong>
                    </span>
                    {phase.isBlocked && (
                      <span className="inline-flex items-center text-xs text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Bloqueada
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {phase.title}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-3xl">
                    {phase.objective}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {completedCount}/{totalCount} completadas
                    </span>
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Items */}
              <div className="divide-y divide-slate-800/80">
                {phaseTasks.map((task) => {
                  const isTaskDone = task.status === 'completed';
                  const isTaskFork = task.id === '1.3.1';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`p-4 sm:p-5 hover:bg-slate-800/40 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isTaskFork ? 'bg-cyan-950/10 border-l-2 border-cyan-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* Status Icon */}
                        <div className="shrink-0 mt-0.5">
                          {task.status === 'completed' && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                          {task.status === 'in_progress' && (
                            <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                          )}
                          {task.status === 'blocked' && (
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          )}
                          {task.status === 'skipped' && (
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                              -
                            </div>
                          )}
                          {task.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                              •
                            </div>
                          )}
                        </div>

                        {/* Task Title & Details */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400">
                              {task.id}
                            </span>
                            <span className="text-xs text-slate-400">
                              {task.subCategory}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              {task.role}
                            </span>

                            {task.isConditional && (
                              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/80 font-medium">
                                <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                                {task.id === '1.3.1' ? 'Punto de Decisión IA' : 'Condicional'}
                              </span>
                            )}

                            {task.aiAnalysis && (
                              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-medium">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Evidencia Validada por IA
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-slate-100">
                            {task.title}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                            {task.description}
                          </p>

                          {/* Quick Command preview snippet */}
                          {task.commands && task.commands.length > 0 && (
                            <div className="pt-1 flex items-center space-x-2">
                              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] font-mono text-emerald-400/90 truncate max-w-md">
                                {task.commands[0].command}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right-side Action */}
                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1 transition"
                        >
                          <span>Ver Ejecución</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
