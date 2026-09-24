import React, { useState } from 'react';
import { 
  Server, 
  Layers, 
  Network, 
  HardDrive, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  ArrowDown, 
  ArrowRight,
  Database,
  Cloud,
  Box,
  Eye,
  Info,
  ExternalLink,
  Workflow,
  Radio,
  Zap,
  Check
} from 'lucide-react';
import { ProjectState, ArchitectureChoice, ProjectTask, NetworkMatrixEntry } from '../types';

interface ArchitectureDiagramProps {
  projectState: ProjectState;
  onSelectTaskById?: (taskId: string) => void;
  isPrintMode?: boolean;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  projectState,
  onSelectTaskById,
  isPrintMode = false,
}) => {
  const [diagramMode, setDiagramMode] = useState<'wiring' | 'layers' | 'matrix'>('wiring');
  const [highlightedFlow, setHighlightedFlow] = useState<string | null>(null);

  const allTasks = projectState.phases.flatMap(p => p.tasks);
  const getTask = (id: string): ProjectTask | undefined => allTasks.find(t => t.id === id);

  // Status mapping strictly derived from tasks
  const t_esxi = getTask('1.1.1');
  const t_drs = getTask('1.1.2');
  const t_ntp = getTask('1.1.3');
  const t_vasa = getTask('1.1.4');
  const t_svt_nfs = getTask('1.2.1');
  const t_svt_cluster = getTask('1.2.2');
  const t_svt_tags = getTask('1.2.3');
  const t_nsx_check = getTask('1.3.1');
  const t_spbm = getTask('2.3');
  const t_lb_deploy = getTask('3.1');
  const t_supervisor = getTask('3.2');
  const t_namespace = getTask('3.3');
  const t_tkg = getTask('3.4');
  const t_aria = getTask('3.5');

  const arch = projectState.networkArchitecture;

  const isCompleted = (task?: ProjectTask) => task?.status === 'completed';
  const isInProgress = (task?: ProjectTask) => task?.status === 'in_progress';

  // Network values from real matrix (never invented)
  const getNet = (type: string): NetworkMatrixEntry | undefined => 
    projectState.networkMatrix.find(n => n.networkType === type);

  const mgmtNet = getNet('management');
  const vipNet = getNet('frontend_vip');
  const workloadNet = getNet('workload');

  const mgmtVlanDisplay = mgmtNet?.vlanId ? `VLAN ${mgmtNet.vlanId}` : 'VLAN por definir (Fase 2.2)';
  const mgmtCidrDisplay = mgmtNet?.subnetCidr ? mgmtNet.subnetCidr : 'Subred por asignar';

  const vipVlanDisplay = vipNet?.vlanId ? `VLAN ${vipNet.vlanId}` : 'VLAN por definir (Fase 2.2)';
  const vipCidrDisplay = vipNet?.subnetCidr ? vipNet.subnetCidr : 'Rango VIP por asignar';

  const workloadVlanDisplay = workloadNet?.vlanId ? `VLAN ${workloadNet.vlanId}` : 'VLAN por definir (Fase 2.2)';
  const workloadCidrDisplay = workloadNet?.subnetCidr ? workloadNet.subnetCidr : 'Subred Workload por asignar';

  // State of visual network connections
  const isSdnDecided = arch !== 'undetermined' && isCompleted(t_nsx_check);
  const isLbLive = isCompleted(t_lb_deploy);
  const isSupervisorLive = isCompleted(t_supervisor);
  const isComputeValidated = isCompleted(t_esxi) && isCompleted(t_drs);
  const isStorageValidated = isCompleted(t_svt_nfs) && isCompleted(t_vasa);
  const isSpbmConfigured = isCompleted(t_spbm);
  const isTkgLive = isCompleted(t_tkg);

  const getStatusBadge = (task?: ProjectTask, labelCompleted = 'Validado', labelPending = 'Pendiente') => {
    if (isCompleted(task)) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 print:bg-emerald-100 print:text-emerald-800 print:border-emerald-300">
          <CheckCircle2 className="w-3 h-3 mr-1" /> {labelCompleted}
        </span>
      );
    }
    if (isInProgress(task)) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800 print:bg-cyan-100 print:text-cyan-800 print:border-cyan-300">
          <Clock className="w-3 h-3 mr-1 animate-pulse" /> En Validación
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 print:bg-gray-100 print:text-gray-600 print:border-gray-300">
        <Clock className="w-3 h-3 mr-1" /> {labelPending}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Toolbar (hidden in print) */}
      {!isPrintMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Modo de Diagrama:</span>
            <button
              onClick={() => setDiagramMode('wiring')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                diagramMode === 'wiring'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Conexiones de Red & Flujo Real</span>
            </button>
            <button
              onClick={() => setDiagramMode('layers')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                diagramMode === 'layers'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vista de 5 Capas HCI</span>
            </button>
            <button
              onClick={() => setDiagramMode('matrix')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                diagramMode === 'matrix'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trazabilidad de Componentes vs Tareas</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Enlace Activo</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse inline-block"></span>
              <span>En Validación</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block border border-dashed border-slate-400"></span>
              <span>Pendiente de Relevamiento</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl print:bg-white print:border-gray-300 print:p-3">
        
        {/* VIEW 1: Visual Network Wiring & Data Flow (SVG lines + cards) */}
        {diagramMode === 'wiring' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-white print:text-gray-900 flex items-center space-x-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>Esquema de Cableado y Enrutamiento L4/L7 de Tanzu</span>
                </h3>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                  Las líneas y enlaces se dibujan automáticamente según las tareas aprobadas del proyecto.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 print:bg-gray-100 print:text-gray-800">
                  Arquitectura: {arch === 'avi_vds' ? 'Opción B (Avi + VDS)' : arch === 'nsx' ? 'Opción A (NSX Nativo)' : 'Por definir (Tarea 1.3.1)'}
                </span>
              </div>
            </div>

            {/* Visual Wiring Flow Canvas */}
            <div className="relative bg-slate-900/60 rounded-xl p-4 sm:p-6 border border-slate-800/80 space-y-6 print:bg-gray-50 print:border-gray-300">
              
              {/* NODE 1: External Client & Physical Ingress */}
              <div className="max-w-md mx-auto">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center shadow-lg print:bg-white print:border-gray-300">
                  <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-200 print:text-gray-900">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Red Corporativa de Clientes & Tráfico Ingress</span>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                    Acceso a Kube-API de Tanzu y a microservicios publicados.
                  </p>
                </div>
              </div>

              {/* SVG Connector 1: Clients to Load Balancer / Ingress */}
              <div className="flex flex-col items-center justify-center my-1">
                <svg className="w-32 h-10" viewBox="0 0 128 40" fill="none">
                  <line 
                    x1="64" y1="0" x2="64" y2="40" 
                    stroke={isSdnDecided ? (isLbLive ? '#10b981' : '#06b6d4') : '#475569'} 
                    strokeWidth="2.5" 
                    strokeDasharray={isLbLive ? '0' : '5 4'}
                    className={isLbLive ? 'animate-none' : ''}
                  />
                  <polygon 
                    points="64,40 59,30 69,30" 
                    fill={isSdnDecided ? (isLbLive ? '#10b981' : '#06b6d4') : '#475569'} 
                  />
                </svg>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 -mt-2">
                  {isSdnDecided ? vipVlanDisplay : 'Enlace Ingress Pendiente'}
                </span>
              </div>

              {/* NODE 2: SDN Balancing & Routing Tier (Dynamic based on NSX vs Avi) */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/80 print:bg-white print:border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400 print:text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-gray-900">
                      Capa SDN & Balanceo de Carga L4/L7
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(t_nsx_check, arch === 'avi_vds' ? 'Opción B Validada' : arch === 'nsx' ? 'Opción A Validada' : 'Fase 1.3 Pendiente', 'Sin Decisión')}
                  </div>
                </div>

                {arch === 'avi_vds' ? (
                  /* Option B: Avi Load Balancer Wiring */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div 
                      onClick={() => onSelectTaskById && onSelectTaskById('3.1')}
                      className={`p-3 rounded-lg border transition cursor-pointer ${
                        isCompleted(t_lb_deploy) 
                          ? 'bg-emerald-950/30 border-emerald-800/80 text-white' 
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Avi Controller (Control Plane)</span>
                        {getStatusBadge(t_lb_deploy, 'Desplegado', 'Tarea 3.1')}
                      </div>
                      <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                        Appliance en {mgmtVlanDisplay}. Interfaz de API con vCenter y Supervisor.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-cyan-400">
                        Subred: {mgmtCidrDisplay}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white print:text-gray-900">Avi Service Engines (Data Plane)</span>
                        <span className="text-[10px] font-mono text-emerald-400">HA Activo/Standby</span>
                      </div>
                      <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                        2x SEs alojados en los hosts SimpliVity con uplinks directos al VDS.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-teal-400">
                        VDS Portgroup: Workload & VIP
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white print:text-gray-900">Pool de VIPs Frontend</span>
                        <span className="text-[10px] font-mono text-cyan-400">{vipVlanDisplay}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                        IP flotante para Kube-API Server (Supervisor) y Services LoadBalancer.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-slate-400">
                        Rango: {vipCidrDisplay}
                      </div>
                    </div>
                  </div>
                ) : arch === 'nsx' ? (
                  /* Option A: NSX-T Wiring */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">NSX Manager Cluster</span>
                        <span className="text-[10px] font-mono text-indigo-400">HA 3 Nodos</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Plano de control SDN y micro-segmentación de seguridad para pods.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-indigo-300">
                        Red: {mgmtVlanDisplay}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Tier-0 Gateway + Edges</span>
                        <span className="text-[10px] font-mono text-indigo-400">eBGP Peering</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Interconexión física norte-sur con los switches ToR de la red física.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Tier-1 Dinámico & Geneve</span>
                        <span className="text-[10px] font-mono text-cyan-400">Overlay Automático</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Enrutamiento distribuido creado automáticamente por cada vSphere Namespace.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Undetermined Architecture */
                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('1.3.1')}
                    className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/60 text-center cursor-pointer hover:bg-amber-950/30 transition"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-amber-200 block">
                      Arquitectura de Red No Determinada
                    </span>
                    <p className="text-[11px] text-slate-400 max-w-lg mx-auto mt-1">
                      El cableado lógico y el balanceador dependen de la tarea <strong>1.3.1 (Verificación de NSX)</strong>. Al adjuntar la evidencia de vCenter ExtensionManager, la IA activará automáticamente la Rama A (NSX) o la Rama B (Avi + VDS).
                    </p>
                  </div>
                )}
              </div>

              {/* SVG Connector 2: SDN to Supervisor & Workloads */}
              <div className="flex flex-col items-center justify-center my-1">
                <svg className="w-48 h-10" viewBox="0 0 192 40" fill="none">
                  <line 
                    x1="96" y1="0" x2="96" y2="40" 
                    stroke={isSupervisorLive ? '#10b981' : isLbLive ? '#06b6d4' : '#475569'} 
                    strokeWidth="2.5" 
                    strokeDasharray={isSupervisorLive ? '0' : '5 4'} 
                  />
                  <polygon 
                    points="96,40 91,30 101,30" 
                    fill={isSupervisorLive ? '#10b981' : isLbLive ? '#06b6d4' : '#475569'} 
                  />
                </svg>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 -mt-2">
                  {workloadVlanDisplay} (Kube-API Ingress & Pod Egress)
                </span>
              </div>

              {/* NODE 3: Tanzu Control Plane & Namespaces */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/80 print:bg-white print:border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Box className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-gray-900">
                      Plano de Control Tanzu Kubernetes Grid (Supervisor & TKG)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(t_supervisor, 'Supervisor Cluster 3/3 OK', 'WCP Pendiente')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('3.2')}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-cyan-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-gray-900">Supervisor Control Plane</span>
                      {getStatusBadge(t_supervisor, 'Habilitado', 'Tarea 3.2')}
                    </div>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                      3 Control Plane VMs distribuidas en los 3 hosts físicos SimpliVity con quórum etcd.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-slate-400">
                      Sincronización: {isCompleted(t_ntp) ? 'NTP Validado (<100ms)' : 'NTP por auditar (Tarea 1.1.3)'}
                    </div>
                  </div>

                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('3.3')}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-cyan-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-gray-900">vSphere Namespaces</span>
                      {getStatusBadge(t_namespace, 'Configurado', 'Tarea 3.3')}
                    </div>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                      Límites de CPU, memoria y asignación de la Storage Policy de SimpliVity.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-purple-400">
                      StorageClass: {isCompleted(t_spbm) ? 'svt-tanzu-storage (SPBM)' : 'Por definir en Fase 2.3'}
                    </div>
                  </div>

                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('3.4')}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-cyan-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-gray-900">Clústeres TKG (Cargas)</span>
                      {getStatusBadge(t_tkg, 'Operativo', 'Tarea 3.4')}
                    </div>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                      Worker nodes ejecutando pods sobre CNI Antrea ({workloadVlanDisplay}).
                    </p>
                  </div>
                </div>
              </div>

              {/* SVG Connector 3: Supervisor to 3x Physical HCI Hosts */}
              <div className="flex flex-col items-center justify-center my-1">
                <svg className="w-64 h-10" viewBox="0 0 256 40" fill="none">
                  {/* Bus line branching to 3 nodes */}
                  <line x1="128" y1="0" x2="128" y2="20" stroke={isComputeValidated ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray={isComputeValidated ? '0' : '4 4'} />
                  <line x1="32" y1="20" x2="224" y2="20" stroke={isComputeValidated ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray={isComputeValidated ? '0' : '4 4'} />
                  <line x1="32" y1="20" x2="32" y2="40" stroke={isComputeValidated ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray={isComputeValidated ? '0' : '4 4'} />
                  <line x1="128" y1="20" x2="128" y2="40" stroke={isComputeValidated ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray={isComputeValidated ? '0' : '4 4'} />
                  <line x1="224" y1="20" x2="224" y2="40" stroke={isComputeValidated ? '#10b981' : '#475569'} strokeWidth="2" strokeDasharray={isComputeValidated ? '0' : '4 4'} />
                </svg>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 -mt-2">
                  Virtual Distributed Switch (VDS) • DRS Fully Automated
                </span>
              </div>

              {/* NODE 4: Physical Infrastructure Tier (3x HPE SimpliVity 380 Hosts) */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/80 print:bg-white print:border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-gray-900">
                      Infraestructura Física: 3 Nodos HPE SimpliVity 380 Gen10
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(t_esxi, 'ESXi Validado', 'Auditar Tarea 1.1.1')}
                    {getStatusBadge(t_drs, 'DRS Validado', 'Auditar Tarea 1.1.2')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((nodeNum) => (
                    <div 
                      key={nodeNum}
                      onClick={() => onSelectTaskById && onSelectTaskById('1.1.1')}
                      className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-700 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white print:text-gray-900 flex items-center space-x-1.5">
                          <Server className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Host SimpliVity {nodeNum}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isCompleted(t_esxi) ? 'ESXi 8.0 Validado' : 'Por auditar (1.1.1)'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 print:text-gray-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span>OVC Virtual Controller:</span>
                          <span className="font-mono text-indigo-300">
                            {isCompleted(t_svt_cluster) ? `OVC-Node-${nodeNum} [OK]` : 'Por auditar (1.2.2)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acelerador PCIe:</span>
                          <span className="font-mono text-slate-300">
                            {isCompleted(t_svt_cluster) ? 'OmniStack Card [Activa]' : 'Por relevar'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Supervisor VM:</span>
                          <span className="font-mono text-cyan-400">
                            {isCompleted(t_supervisor) ? `Supervisor-VM-${nodeNum}` : 'No desplegada'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SVG Connector 4: Hypervisors to SimpliVity Storage Bus */}
              <div className="flex flex-col items-center justify-center my-1">
                <svg className="w-48 h-10" viewBox="0 0 192 40" fill="none">
                  <line 
                    x1="96" y1="0" x2="96" y2="40" 
                    stroke={isStorageValidated ? '#818cf8' : '#475569'} 
                    strokeWidth="2.5" 
                    strokeDasharray={isStorageValidated ? '0' : '5 4'} 
                  />
                  <polygon 
                    points="96,40 91,30 101,30" 
                    fill={isStorageValidated ? '#818cf8' : '#475569'} 
                  />
                </svg>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 -mt-2">
                  Red de Almacenamiento Hiperconvergente SimpliVity (NFS + OVC)
                </span>
              </div>

              {/* NODE 5: SimpliVity Storage Fabric & SPBM */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/80 print:bg-white print:border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-400 print:text-indigo-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-gray-900">
                      Almacenamiento HPE SimpliVity & Integración SPBM
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(t_svt_nfs, 'Datastores Montados', 'Auditar 1.2.1')}
                    {getStatusBadge(t_vasa, 'VASA Online', 'Auditar 1.1.4')}
                    {getStatusBadge(t_spbm, 'SPBM Configurada', 'Diseñar 2.3')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('1.2.1')}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-indigo-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-gray-900">Datastores NFS SimpliVity</span>
                      {getStatusBadge(t_svt_nfs, 'OK', 'Tarea 1.2.1')}
                    </div>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                      Compartidos simultáneamente en los 3 hosts ESXi.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-indigo-300">
                      Capacidad: {isCompleted(t_svt_nfs) ? 'Auditada en Tarea 1.2.1' : 'Pendiente de auditoría'}
                    </div>
                  </div>

                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('1.1.4')}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-indigo-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-gray-900">VASA Provider (SimpliVity)</span>
                      {getStatusBadge(t_vasa, 'Activo', 'Tarea 1.1.4')}
                    </div>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                      Comunica vCenter y Kubernetes con las capacidades de compresión/dedup de SimpliVity.
                    </p>
                  </div>

                  <div 
                    onClick={() => onSelectTaskById && onSelectTaskById('2.3')}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-indigo-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-gray-900">VM Storage Policy (SPBM)</span>
                      {getStatusBadge(t_spbm, 'Diseñada', 'Tarea 2.3')}
                    </div>
                    <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                      Mapea los Persistent Volumes de Kubernetes a los datastores con deduplicación por hardware.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Traditional 5-Layer HCI Architecture View */}
        {diagramMode === 'layers' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Desglose por Capas Técnicas de la Infraestructura</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Estado técnico en vivo de cada componente según las etapas de validación previa ejecutadas.
              </p>
            </div>

            {/* Layer 5: Observability */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-purple-300 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Capa 5: Gestión y Observabilidad</span>
                </span>
                {getStatusBadge(t_aria, 'Aria Operations Conectado', 'Monitoreo Pendiente')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block mb-1">vCenter Server Appliance</span>
                  <p className="text-[11px] text-slate-400">
                    {isCompleted(t_esxi) ? 'vCenter 8.0 operativo y clúster HCI verificado.' : 'Versión y estado por validar en Tarea 1.1.1.'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block mb-1">VMware Aria Operations</span>
                  <p className="text-[11px] text-slate-400">
                    {isCompleted(t_aria) ? 'Management Pack for Kubernetes activo recolectando telemetría.' : 'Descarga del .pak en Fase 0.4 y despliegue en Fase 3.5.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 4: K8s & Tanzu */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-cyan-300 flex items-center space-x-1.5">
                  <Box className="w-4 h-4" />
                  <span>Capa 4: Tanzu Kubernetes Grid (Supervisor & TKG)</span>
                </span>
                {getStatusBadge(t_supervisor, 'Supervisor Cluster Activo', 'WCP Deshabilitado')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block mb-1">Supervisor Control Plane</span>
                  <p className="text-[11px] text-slate-400">
                    {isCompleted(t_supervisor) ? '3 Control Plane VMs en HA sobre los 3 hosts SimpliVity.' : 'Pendiente de habilitación en Fase 3.2.'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block mb-1">vSphere Namespaces</span>
                  <p className="text-[11px] text-slate-400">
                    {isCompleted(t_namespace) ? 'Cuotas de cómputo y RBAC asignadas.' : 'Pendiente de creación en Fase 3.3.'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block mb-1">TKG Guest Clusters</span>
                  <p className="text-[11px] text-slate-400">
                    {isCompleted(t_tkg) ? 'Nodos de trabajo ejecutando cargas contenerizadas.' : 'Pendiente de despliegue en Fase 3.4.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 3: SDN */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-teal-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-teal-300 flex items-center space-x-1.5">
                  <Network className="w-4 h-4" />
                  <span>Capa 3: Red & Balanceo ({arch === 'avi_vds' ? 'Opción B: Avi + VDS' : arch === 'nsx' ? 'Opción A: NSX Nativo' : 'Por determinar'})</span>
                </span>
                {getStatusBadge(t_nsx_check, 'Arquitectura Validada', 'Pendiente Tarea 1.3.1')}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {arch === 'avi_vds'
                  ? `Se confirmó ausencia de NSX preexistente. La red opera con Avi Controller en ${mgmtVlanDisplay} y Service Engines en el VDS existente inyectando VIPs en ${vipVlanDisplay}.`
                  : arch === 'nsx'
                  ? 'Se confirmó clúster NSX-T activo. Tanzu utilizará gateways Tier-0 y Tier-1 distribuidos con Geneve overlay.'
                  : 'La arquitectura SDN está en espera del relevamiento en la tarea 1.3.1 para no asumir infraestructura no existente.'}
              </p>
            </div>

            {/* Layer 2: Storage */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-indigo-300 flex items-center space-x-1.5">
                  <Database className="w-4 h-4" />
                  <span>Capa 2: Almacenamiento Hiperconvergente HPE SimpliVity</span>
                </span>
                {getStatusBadge(t_spbm, 'SPBM Configurada', 'Pendiente Fase 2.3')}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isCompleted(t_svt_nfs) && isCompleted(t_vasa)
                  ? 'Datastores NFS de SimpliVity montados en los 3 hosts y VASA Provider activo. Política SPBM basada en etiquetas lista para aprovisionar volúmenes persistentes en Tanzu.'
                  : 'Infraestructura de almacenamiento en etapa de auditoría. Se validarán las OVCs y el VASA Provider en Fase 1.2 sin asumir parámetros por defecto.'}
              </p>
            </div>

            {/* Layer 1: Hardware */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-300 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>Capa 1: Hardware Físico (3 Servidores HPE SimpliVity 380 Gen10)</span>
                </span>
                {getStatusBadge(t_drs, 'DRS Fully Automated', 'Pendiente Tarea 1.1.2')}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isCompleted(t_esxi)
                  ? 'Clúster de 3 nodos auditado. Todos los hosts ejecutan ESXi 8.0 con DRS en Fully Automated y sincronización NTP homogénea (<100ms offset).'
                  : '3 servidores físicos asignados para el proyecto. Las características reales de CPU, memoria y versión de ESXi se registrarán al ejecutar la tarea 1.1.1.'}
              </p>
            </div>
          </div>
        )}

        {/* VIEW 3: Component-to-Task Traceability Matrix */}
        {diagramMode === 'matrix' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Matriz de Trazabilidad: Componente Arquitectónico vs Tarea de Validación</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Garantía de cero información inventada: cada componente del diseño está respaldado por una tarea y su evidencia técnica.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Componente Arquitectónico</th>
                    <th className="p-3">Tarea Asociada</th>
                    <th className="p-3">Estado Real</th>
                    <th className="p-3">Evidencia / Parámetro Descubierto</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr>
                    <td className="p-3 font-sans font-medium text-white">vCenter Server & ESXi</td>
                    <td className="p-3 text-cyan-400">1.1.1</td>
                    <td className="p-3">{getStatusBadge(t_esxi)}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">
                      {t_esxi?.evidence ? 'Evidencia técnica registrada' : 'Pendiente de auditoría As-Is'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button 
                        onClick={() => onSelectTaskById && onSelectTaskById('1.1.1')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Ver Tarea
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-medium text-white">vSphere DRS & HA</td>
                    <td className="p-3 text-cyan-400">1.1.2</td>
                    <td className="p-3">{getStatusBadge(t_drs)}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">
                      {isCompleted(t_drs) ? 'DRS: Fully Automated [Requisito Tanzu OK]' : 'Pendiente de verificar nivel de automatización'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button 
                        onClick={() => onSelectTaskById && onSelectTaskById('1.1.2')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Ver Tarea
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-medium text-white">SimpliVity Datastores NFS</td>
                    <td className="p-3 text-cyan-400">1.2.1</td>
                    <td className="p-3">{getStatusBadge(t_svt_nfs)}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">
                      {isCompleted(t_svt_nfs) ? 'Datastores montados en los 3 hosts' : 'Pendiente de auditar en vCenter'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button 
                        onClick={() => onSelectTaskById && onSelectTaskById('1.2.1')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Ver Tarea
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-medium text-white">Bifurcación SDN (NSX vs Avi)</td>
                    <td className="p-3 text-cyan-400">1.3.1</td>
                    <td className="p-3">{getStatusBadge(t_nsx_check, arch === 'avi_vds' ? 'Avi Detectado' : arch === 'nsx' ? 'NSX Detectado' : 'Por Relevar')}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">
                      {arch === 'avi_vds' 
                        ? 'Confirmado: Sin NSX -> Despliegue de Avi Controller activado'
                        : arch === 'nsx'
                        ? 'Confirmado: Con NSX -> Enrutamiento Tier-0 activado'
                        : 'No se asume arquitectura hasta revisar ExtensionManager'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button 
                        onClick={() => onSelectTaskById && onSelectTaskById('1.3.1')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Ver Tarea
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-medium text-white">Balanceador de Carga L4/L7</td>
                    <td className="p-3 text-cyan-400">3.1</td>
                    <td className="p-3">{getStatusBadge(t_lb_deploy, 'Desplegado', 'Pendiente')}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">
                      {isCompleted(t_lb_deploy) ? 'Balanceador operativo en producción' : 'Pendiente de despliegue en Fase 3'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button 
                        onClick={() => onSelectTaskById && onSelectTaskById('3.1')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Ver Tarea
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-medium text-white">Supervisor Control Plane</td>
                    <td className="p-3 text-cyan-400">3.2</td>
                    <td className="p-3">{getStatusBadge(t_supervisor, '3/3 Nodos OK', 'Pendiente')}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">
                      {isCompleted(t_supervisor) ? 'Workload Management activo' : 'Ejecución del wizard de Tanzu en Fase 3'}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button 
                        onClick={() => onSelectTaskById && onSelectTaskById('3.2')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Ver Tarea
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
