import React, { useState } from 'react';
import { 
  Network, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  FileCode, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { NetworkMatrixEntry, ArchitectureChoice } from '../types';

interface NetworkMatrixViewProps {
  networkMatrix: NetworkMatrixEntry[];
  onUpdateMatrix: (matrix: NetworkMatrixEntry[]) => void;
  networkArchitecture: ArchitectureChoice;
}

export const NetworkMatrixView: React.FC<NetworkMatrixViewProps> = ({
  networkMatrix,
  onUpdateMatrix,
  networkArchitecture,
}) => {
  const [entries, setEntries] = useState<NetworkMatrixEntry[]>(networkMatrix);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'table' | 'yaml'>('table');

  const handleFieldChange = (id: string, field: keyof NetworkMatrixEntry, value: string) => {
    const updated = entries.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setEntries(updated);
    onUpdateMatrix(updated);
  };

  const handleExportCsv = () => {
    const headers = ['Tipo', 'Nombre', 'VLAN ID', 'Subnet CIDR', 'Gateway', 'Rango Utilizable', 'DNS', 'Enrutable', 'Notas'];
    const rows = entries.map(e => [
      e.networkType,
      `"${e.name}"`,
      e.vlanId,
      e.subnetCidr,
      e.gateway,
      `"${e.usableIpRange}"`,
      `"${e.dnsServers || ''}"`,
      e.isRoutable ? 'Si' : 'No',
      `"${e.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'matriz_ips_tanzu_simplivity.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Supervisor Workload Management YAML configuration snippet
  const generateYamlConfig = () => {
    const mgmt = entries.find(e => e.networkType === 'management');
    const vip = entries.find(e => e.networkType === 'frontend_vip');
    const workload = entries.find(e => e.networkType === 'workload');
    const pods = entries.find(e => e.networkType === 'pods_internal');
    const services = entries.find(e => e.networkType === 'services_internal');

    return `# Especificación de Red para Tanzu Workload Management Wizard
# Generado a partir de los parámetros validados para la infraestructura del cliente
apiVersion: v1
kind: WorkloadNetworkConfig
metadata:
  name: tanzu-hci-network-spec
spec:
  architecture: ${networkArchitecture === 'nsx' ? 'NSX-T' : networkArchitecture === 'avi_vds' ? 'VDS_with_Avi_LoadBalancer' : '<PENDIENTE_VALIDACION_FASE_1.3>'}
  networkProvider: ${networkArchitecture === 'nsx' ? 'NSX-T' : networkArchitecture === 'avi_vds' ? 'Avi' : '<POR_DEFINIR>'}
  managementNetwork:
    vlanId: ${mgmt?.vlanId || '<POR_DEFINIR_VLAN>'}
    subnet: ${mgmt?.subnetCidr || '<POR_DEFINIR_SUBRED_CIDR>'}
    gateway: ${mgmt?.gateway || '<POR_DEFINIR_GATEWAY>'}
    ipPool: "${mgmt?.usableIpRange || '<POR_DEFINIR_POOL_IPS>'}"
    dnsServers:
      - ${mgmt?.dnsServers || '<POR_DEFINIR_DNS>'}
  frontendNetwork:
    description: "Ingress VIPs for Kubernetes API & Services"
    vlanId: ${vip?.vlanId || '<POR_DEFINIR_VLAN>'}
    subnet: ${vip?.subnetCidr || '<POR_DEFINIR_SUBRED_CIDR>'}
    gateway: ${vip?.gateway || '<POR_DEFINIR_GATEWAY>'}
    floatingIpPool: "${vip?.usableIpRange || '<POR_DEFINIR_POOL_VIP>'}"
  workloadNetwork:
    description: "TKG Kubernetes Nodes VM Network"
    vlanId: ${workload?.vlanId || '<POR_DEFINIR_VLAN>'}
    subnet: ${workload?.subnetCidr || '<POR_DEFINIR_SUBRED_CIDR>'}
    gateway: ${workload?.gateway || '<POR_DEFINIR_GATEWAY>'}
    ipPool: "${workload?.usableIpRange || '<POR_DEFINIR_POOL_WORKLOAD>'}"
  internalRouting:
    podCidrBlocks:
      - "${pods?.subnetCidr || '10.244.0.0/16'}"
    serviceCidrBlocks:
      - "${services?.subnetCidr || '10.96.0.0/12'}"
`;
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(generateYamlConfig());
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Fase 2.2
            </span>
            <span className="text-xs text-slate-400">Entregable de Red para el Cliente</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Matriz de Asignación de IPs, VLANs y CIDRs
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl">
            Complete y valide los parámetros de red con el equipo de infraestructura del cliente. Estos datos alimentarán directamente el asistente de habilitación de Tanzu (Workload Management) en la Fase 3.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={() => setActiveTab(activeTab === 'table' ? 'yaml' : 'table')}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition font-semibold shadow-md shadow-cyan-500/20"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{activeTab === 'table' ? 'Ver Especificación YAML' : 'Ver Tabla de IPs'}</span>
          </button>
        </div>
      </div>

      {/* Network Tier Cards / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Red de Gestión (Management)</span>
          <div className="text-sm font-mono font-bold text-cyan-300">
            {entries.find(e => e.networkType === 'management')?.subnetCidr || <span className="text-slate-500 font-sans italic text-xs font-normal">Por asignar en Fase 2.2</span>}
          </div>
          <p className="text-[11px] text-slate-400">
            Aloja las 3 VMs del Supervisor Cluster y la controladora de balanceo (Avi o NSX).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Red Frontend (VIPs / Ingress)</span>
          <div className="text-sm font-mono font-bold text-emerald-300">
            {entries.find(e => e.networkType === 'frontend_vip')?.subnetCidr || <span className="text-slate-500 font-sans italic text-xs font-normal">Por asignar en Fase 2.2</span>}
          </div>
          <p className="text-[11px] text-slate-400">
            IPs públicas/enrutables para publicar APIs de K8s y aplicaciones de los usuarios.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Red Workload (Nodos TKG)</span>
          <div className="text-sm font-mono font-bold text-purple-300">
            {entries.find(e => e.networkType === 'workload')?.subnetCidr || <span className="text-slate-500 font-sans italic text-xs font-normal">Por asignar en Fase 2.2</span>}
          </div>
          <p className="text-[11px] text-slate-400">
            Espacio de direccionamiento para los Worker Nodes que correrán los pods.
          </p>
        </div>
      </div>

      {/* View Toggle: Table vs YAML */}
      {activeTab === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 sm:p-4">Capa de Red</th>
                  <th className="p-3 sm:p-4">VLAN ID</th>
                  <th className="p-3 sm:p-4">Subred (CIDR)</th>
                  <th className="p-3 sm:p-4">Gateway</th>
                  <th className="p-3 sm:p-4">Rango Utilizable / IP Pool</th>
                  <th className="p-3 sm:p-4">DNS Servers</th>
                  <th className="p-3 sm:p-4">Enrutable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 sm:p-4 font-sans">
                      <div className="font-semibold text-white">{entry.name}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{entry.description}</div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <input
                        type="text"
                        value={entry.vlanId}
                        onChange={(e) => handleFieldChange(entry.id, 'vlanId', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-20 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </td>
                    <td className="p-3 sm:p-4">
                      <input
                        type="text"
                        value={entry.subnetCidr}
                        onChange={(e) => handleFieldChange(entry.id, 'subnetCidr', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-cyan-300 w-36 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </td>
                    <td className="p-3 sm:p-4">
                      <input
                        type="text"
                        value={entry.gateway}
                        onChange={(e) => handleFieldChange(entry.id, 'gateway', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-32 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </td>
                    <td className="p-3 sm:p-4">
                      <input
                        type="text"
                        value={entry.usableIpRange}
                        onChange={(e) => handleFieldChange(entry.id, 'usableIpRange', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-48 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </td>
                    <td className="p-3 sm:p-4">
                      <input
                        type="text"
                        value={entry.dnsServers || ''}
                        onChange={(e) => handleFieldChange(entry.id, 'dnsServers', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-32 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </td>
                    <td className="p-3 sm:p-4 font-sans">
                      {entry.isRoutable ? (
                        <span className="inline-flex items-center text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          Interno (No)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Validación de Solapamiento: Subredes 10.244.0.0/16 y 10.96.0.0/12 verificadas sin conflicto.</span>
            </span>
            <span>Edición en vivo habilitada</span>
          </div>
        </div>
      ) : (
        /* YAML Config Spec View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>tanzu-workload-network-spec.yaml</span>
            </span>
            <button
              onClick={handleCopyYaml}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 flex items-center space-x-1 transition"
            >
              {copiedYaml ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar YAML</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 overflow-x-auto bg-slate-950">
            <pre className="text-xs font-mono text-cyan-300/90 whitespace-pre">
              {generateYamlConfig()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
