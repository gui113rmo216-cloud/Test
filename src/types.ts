export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';

export type TaskRole = 'Cliente' | 'Ingeniero de Implementación' | 'IA / Arquitecto';

export type ArchitectureChoice = 'undetermined' | 'nsx' | 'avi_vds';

export interface CommandSnippet {
  type: 'powercli' | 'bash' | 'ssh' | 'kubectl' | 'gui';
  label: string;
  command: string;
  explanation?: string;
}

export interface PlanModification {
  targetTaskId: string;
  action: 'activate' | 'skip' | 'modify' | 'alert';
  note: string;
}

export interface AiAnalysisResult {
  verdict: 'pass' | 'fail' | 'warning' | 'needs_clarification';
  detectedArchitecture?: ArchitectureChoice;
  confidence: number;
  summary: string;
  technicalFindings: string[];
  recommendations: string[];
  planModifications: PlanModification[];
  analyzedAt: string;
}

export interface EvidenceItem {
  id: string;
  taskId: string;
  type: 'text_log' | 'screenshot' | 'csv' | 'file';
  content: string;
  fileName?: string;
  submittedBy: string;
  submittedAt: string;
  notes?: string;
}

export interface ProjectTask {
  id: string;
  phaseId: 'phase_0' | 'phase_1' | 'phase_2' | 'phase_3';
  subCategory: string;
  title: string;
  description: string;
  role: TaskRole;
  status: TaskStatus;
  isConditional?: boolean;
  conditionalBranch?: 'nsx' | 'avi_vds' | 'none';
  conditionNote?: string;
  executionSteps: string[];
  commands: CommandSnippet[];
  guiBreadcrumb?: string;
  requiredEvidence: string;
  expectedResult: string;
  warnings?: string[];
  sampleEvidence?: {
    label: string;
    content: string;
  }[];
  evidence?: EvidenceItem;
  aiAnalysis?: AiAnalysisResult;
  updatedAt?: string;
}

export interface ProjectPhase {
  id: 'phase_0' | 'phase_1' | 'phase_2' | 'phase_3';
  number: number;
  title: string;
  objective: string;
  defaultRole: TaskRole;
  isBlocked: boolean;
  blockReason?: string;
  tasks: ProjectTask[];
}

export interface NetworkMatrixEntry {
  id: string;
  networkType: 'management' | 'frontend_vip' | 'workload' | 'pods_internal' | 'services_internal';
  name: string;
  description: string;
  vlanId: string;
  subnetCidr: string;
  gateway: string;
  usableIpRange: string;
  dnsServers?: string;
  notes?: string;
  isRoutable: boolean;
}

export interface DiscoveredInfrastructure {
  vCenterVersion?: string;
  vCenterFqdn?: string;
  esxiBuild?: string;
  ntpServers?: string[];
  ntpOffsetMs?: number;
  drsStatus?: string;
  haStatus?: string;
  simplivityVersion?: string;
  ovcStatus?: string;
  vasaProviderStatus?: string;
  nfsDatastores?: string[];
  spbmPolicyName?: string;
  nsxDetected?: boolean;
  nsxVersion?: string;
  aviVersion?: string;
  aviControllerIp?: string;
  supervisorVip?: string;
  tkgVersion?: string;
}

export interface ProjectState {
  clientName: string;
  clusterName: string;
  hostsCount: number;
  storagePlatform: string;
  networkArchitecture: ArchitectureChoice;
  architectureConfidence: number;
  lastArchitectureDecisionDate?: string;
  decisionReason?: string;
  discoveredInfrastructure?: DiscoveredInfrastructure;
  phases: ProjectPhase[];
  networkMatrix: NetworkMatrixEntry[];
  auditLogs: {
    id: string;
    timestamp: string;
    type: 'evidence_submitted' | 'task_completed' | 'plan_adapted' | 'network_updated';
    message: string;
    author: string;
  }[];
}
