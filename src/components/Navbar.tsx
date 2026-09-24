import React, { useState } from 'react';
import { 
  Server, 
  Layers, 
  Network, 
  Bot, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Key,
  Edit3
} from 'lucide-react';
import { ArchitectureChoice } from '../types';

interface NavbarProps {
  activeTab: 'plan' | 'diagram' | 'matrix' | 'advisor' | 'locker' | 'report';
  setActiveTab: (tab: 'plan' | 'diagram' | 'matrix' | 'advisor' | 'locker' | 'report') => void;
  networkArchitecture: ArchitectureChoice;
  progressPercent: number;
  completedTasks: number;
  totalTasks: number;
  clientName: string;
  clusterName: string;
  hasAiKey: boolean;
  onOpenByokModal: () => void;
  onUpdateClientName: (name: string) => void;
  onUpdateClusterName: (name: string) => void;
  onResetProject: () => void;
  onQuickSimulate: (scenario: 'avi_vds' | 'nsx') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  networkArchitecture,
  progressPercent,
  completedTasks,
  totalTasks,
  clientName,
  clusterName,
  hasAiKey,
  onOpenByokModal,
  onUpdateClientName,
  onUpdateClusterName,
  onResetProject,
  onQuickSimulate,
}) => {
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientInput, setClientInput] = useState(clientName);
  const [isEditingCluster, setIsEditingCluster] = useState(false);
  const [clusterInput, setClusterInput] = useState(clusterName);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      {/* Top Banner: Project Metadata & Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo, Cluster & Client Titles */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight">
                  vSphere with Tanzu sobre HCI
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  HPE SimpliVity 380 (3 nodos)
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 flex-wrap gap-y-1">
                {/* Editable Client Name */}
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Cliente:</span>
                  {isEditingClient ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onUpdateClientName(clientInput.trim());
                        setIsEditingClient(false);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <input
                        type="text"
                        value={clientInput}
                        onChange={(e) => setClientInput(e.target.value)}
                        placeholder="Nombre del Cliente..."
                        className="bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-[10px] bg-cyan-600 px-1.5 py-0.5 rounded text-white font-semibold"
                      >
                        Guardar
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setClientInput(clientName);
                        setIsEditingClient(true);
                      }}
                      title="Clic para editar el nombre del cliente"
                      className="font-medium text-cyan-300 hover:text-cyan-200 underline decoration-dashed underline-offset-2 flex items-center gap-1"
                    >
                      <span>{clientName || 'Sin definir (Clic aquí)'}</span>
                      <Edit3 className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  )}
                </div>

                <span className="text-slate-600">•</span>

                {/* Editable Cluster Name */}
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Clúster:</span>
                  {isEditingCluster ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onUpdateClusterName(clusterInput.trim());
                        setIsEditingCluster(false);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <input
                        type="text"
                        value={clusterInput}
                        onChange={(e) => setClusterInput(e.target.value)}
                        placeholder="Nombre del clúster..."
                        className="bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-[10px] bg-cyan-600 px-1.5 py-0.5 rounded text-white font-semibold"
                      >
                        Guardar
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setClusterInput(clusterName);
                        setIsEditingCluster(true);
                      }}
                      title="Clic para editar el nombre del clúster vSphere"
                      className="font-medium text-slate-300 hover:text-cyan-300 underline decoration-dashed underline-offset-2 flex items-center gap-1"
                    >
                      <span>{clusterName || 'Cluster-HCI-01 (Clic para editar)'}</span>
                      <Edit3 className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Status Badge, BYOK Key Button & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* BYOK Activation Button / Status */}
            <button
              id="btn-byok-modal"
              onClick={onOpenByokModal}
              title={hasAiKey ? 'IA Activa con Google Gemini. Clic para gestionar tu clave.' : 'Haz clic para activar la IA con tu Google Gemini API Key'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                hasAiKey
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/60'
                  : 'bg-cyan-950/70 text-cyan-300 border-cyan-700/80 hover:bg-cyan-900/70 animate-pulse'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasAiKey ? 'IA Conectada' : 'Activar IA (BYOK)'}</span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </button>

            {/* Architecture pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Network className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">SDN:</span>
              {networkArchitecture === 'undetermined' && (
                <span className="inline-flex items-center text-xs font-medium text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Pendiente (Fase 1.3)
                </span>
              )}
              {networkArchitecture === 'avi_vds' && (
                <span className="inline-flex items-center text-xs font-semibold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/80">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Opción B: Avi LB
                </span>
              )}
              {networkArchitecture === 'nsx' && (
                <span className="inline-flex items-center text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/80">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Opción A: NSX Nativo
                </span>
              )}
            </div>

            {/* Progress metric */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-300">
                  {completedTasks} / {totalTasks} ({progressPercent}%)
                </div>
                <div className="w-20 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick simulation dropdown / reset */}
            <div className="flex items-center space-x-1.5">
              <button
                id="btn-quick-sim-avi"
                onClick={() => onQuickSimulate('avi_vds')}
                title="Simular relevamiento As-Is sin NSX (activa Avi LB Opción B)"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md border border-slate-700 transition flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="hidden md:inline">Simular:</span>
                <span>Sin NSX</span>
              </button>
              <button
                id="btn-quick-sim-nsx"
                onClick={() => onQuickSimulate('nsx')}
                title="Simular relevamiento As-Is con NSX-T instalado (Opción A)"
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md border border-slate-700 transition flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="hidden md:inline">Simular:</span>
                <span>Con NSX</span>
              </button>
              <button
                id="btn-reset-project"
                onClick={onResetProject}
                title="Reiniciar plan a estado inicial"
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-800 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
            <button
              id="tab-plan"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'plan'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Plan Dinámico de Proyecto</span>
            </button>

            <button
              id="tab-diagram"
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'diagram'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Diagrama Arquitectónico Real</span>
            </button>

            <button
              id="tab-matrix"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Matriz de IPs y Red (Fase 2.2)</span>
            </button>

            <button
              id="tab-advisor"
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'advisor'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Asistente Arquitecto IA</span>
            </button>

            <button
              id="tab-locker"
              onClick={() => setActiveTab('locker')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'locker'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Bóveda de Evidencias</span>
            </button>

            <button
              id="tab-report"
              onClick={() => setActiveTab('report')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'report'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Informe Ejecutivo</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
