import { ProjectState, ProjectPhase } from '../types';

export const initialPhases: ProjectPhase[] = [
  {
    id: 'phase_0',
    number: 0,
    title: 'Fase 0: Preparación, Licenciamiento y Descargas',
    objective: 'Asegurar que todos los recursos, binarios y licencias estén disponibles en la red local antes de tocar la infraestructura física.',
    defaultRole: 'Cliente',
    isBlocked: false,
    tasks: [
      {
        id: '0.1',
        phaseId: 'phase_0',
        subCategory: 'Licenciamiento',
        title: 'Verificación de Suscripción VCF / VVF',
        description: 'El cliente debe ingresar al portal de VMware/Broadcom Customer Connect y confirmar que posee licencias activas de VMware Cloud Foundation (VCF) o VMware vSphere Foundation (VVF) con capacidad de cores para cubrir los 3 hosts del clúster HCI.',
        role: 'Cliente',
        status: 'pending',
        executionSteps: [
          'Ingresar al portal de licencias de Broadcom con las credenciales corporativas.',
          'Navegar a "Entitlements" -> "VMware Cloud Foundation" o "vSphere Foundation".',
          'Contabilizar la suma de cores físicos de los 3 servidores HPE SimpliVity 380 (ej. 2 sockets x 16 cores = 32 cores por host = 96 cores en total).',
          'Verificar que la cantidad de cores asignados cubra o supere este requisito.',
          'Descargar o copiar la clave de licencia para vCenter y ESXi.'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Calcular cores totales en vCenter (PowerCLI)',
            command: 'Get-VMHost | Measure-Object -Property NumCpu -Sum | Select-Object Sum',
            explanation: 'Suma los cores de CPU de todos los hosts administrados.'
          }
        ],
        guiBreadcrumb: 'Broadcom Support Portal > My Entitlements > Licenses',
        requiredEvidence: 'Captura de pantalla del portal de licencias mostrando la cantidad de Cores disponibles y la suite (VCF/VVF).',
        expectedResult: 'Licenciamiento VCF/VVF con capacidad >= al total de cores de los 3 hosts.',
        warnings: [
          'El modelo de licenciamiento actual de VMware exige un mínimo de 16 cores por procesador físico.'
        ],
        sampleEvidence: [
          {
            label: 'Licencia VCF 96 Cores Válida',
            content: `[BROADCOM SUPPORT PORTAL]
Entitlement Account: 0014589211 - Cliente Corporativo HCI
Product: VMware Cloud Foundation Advanced (VCF)
License Key: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
Quantity Entitled: 96 Cores
Expiration Date: 2027-12-31
Status: Active and Compliant
Hosts Covered: 3 Nodes HPE ProLiant DL380 Gen10 (32 cores c/u)`
          }
        ]
      },
      {
        id: '0.2',
        phaseId: 'phase_0',
        subCategory: 'Binarios',
        title: 'Descarga de TKr (Tanzu Kubernetes Releases)',
        description: 'Descargar las imágenes OVA de Kubernetes (Photon OS o Ubuntu) desde Customer Connect en caso de que el vCenter no posea salida directa a Internet hacia VMware Marketplace.',
        role: 'Cliente',
        status: 'pending',
        executionSteps: [
          'Revisar la matriz de interoperabilidad de vSphere 8 y Tanzu para seleccionar versiones compatibles de Kubernetes (ej. v1.26, v1.27, v1.28).',
          'Descargar los archivos OVA de TKr (Photon OS y/o Ubuntu LTS).',
          'Colocar las imágenes descargadas en la máquina de gestión (Jumpbox) o repositorio local para subirlas a la Content Library en Fase 3.'
        ],
        commands: [],
        guiBreadcrumb: 'Customer Connect > Products > Tanzu Kubernetes Releases',
        requiredEvidence: 'Confirmación de descarga en jumpbox con nombres y hashes SHA256 de las OVAs de TKr.',
        expectedResult: 'Al menos dos versiones soportadas de TKr descargadas localmente.',
        sampleEvidence: [
          {
            label: 'Listado de OVAs descargadas',
            content: `Directory of D:\\Tanzu_Binaries\\TKr:
photon-3-kube-v1.27.6+vmware.1-tkg.1.ova [Size: 2.1 GB, SHA256: e8b941... Verified]
ubuntu-2004-kube-v1.26.8+vmware.1-tkg.1.ova [Size: 2.4 GB, SHA256: 4f1a02... Verified]`
          }
        ]
      },
      {
        id: '0.3',
        phaseId: 'phase_0',
        subCategory: 'Herramientas',
        title: 'Descarga de Herramientas CLI (kubectl y Tanzu CLI)',
        description: 'Descargar el conjunto de herramientas de línea de comandos para la administración de clústeres: kubectl, Tanzu CLI y el vSphere Plugin for Tanzu CLI.',
        role: 'Cliente',
        status: 'pending',
        executionSteps: [
          'Descargar el binario oficial de kubectl para Windows o Linux (según el SO de la jumpbox).',
          'Descargar el paquete Tanzu CLI v1.x compatible con la versión de vSphere.',
          'Verificar que los binarios tengan permisos de ejecución y estén agregados al PATH del sistema.'
        ],
        commands: [
          {
            type: 'bash',
            label: 'Verificar versión de herramientas en Jumpbox',
            command: 'kubectl version --client && tanzu version',
            explanation: 'Valida la instalación de las herramientas de administración.'
          }
        ],
        guiBreadcrumb: 'vCenter > Workload Management > Tools Download o VMware Portal',
        requiredEvidence: 'Output de ejecución de `kubectl version --client` y `tanzu version` en la jumpbox.',
        expectedResult: 'Binarios operativos en la estación del administrador.',
        sampleEvidence: [
          {
            label: 'Salida de terminal en Jumpbox',
            content: `C:\\Users\\admin> kubectl version --client
Client Version: v1.27.4
Kustomize Version: v5.0.1

C:\\Users\\admin> tanzu version
version: v1.0.0
buildDate: 2023-10-18
sha: 9b95f1906`
          }
        ]
      },
      {
        id: '0.4',
        phaseId: 'phase_0',
        subCategory: 'Observabilidad',
        title: 'Descarga de Observabilidad (Management Pack para Aria Ops)',
        description: 'Descargar el archivo .pak del "VMware Aria Operations Management Pack for Kubernetes" para la integración de monitoreo en la Fase 3.',
        role: 'Cliente',
        status: 'pending',
        executionSteps: [
          'Ingresar al portal de descargas de Aria Operations.',
          'Localizar el Management Pack for Kubernetes compatible con la versión de Aria Ops actual.',
          'Descargar el archivo con extensión .pak y guardarlo en el repositorio local.'
        ],
        commands: [],
        guiBreadcrumb: 'Customer Connect > VMware Aria Operations > Management Packs',
        requiredEvidence: 'Archivo .pak descargado en la jumpbox y hash de integridad verificado.',
        expectedResult: 'Archivo Aria_Operations_MP_for_Kubernetes_vX.X.pak disponible.',
        sampleEvidence: [
          {
            label: 'Confirmación archivo .pak',
            content: `Archivo: vmware-aria-operations-management-pack-for-kubernetes-2.3.0.pak
Tamaño: 84.2 MB
Ubicación: D:\\Tanzu_Binaries\\Aria_Ops_MP\\
Hash SHA256: d8231ab4490192eef851c890123efd312... OK`
          }
        ]
      },
      {
        id: '0.5',
        phaseId: 'phase_0',
        subCategory: 'Balanceador',
        title: 'Descarga Condicional: NSX Advanced Load Balancer (Avi)',
        description: 'Descargar la OVA de Avi Controller y el archivo de licencia Basic. NOTA: Su necesidad final dependerá del resultado del "Check de NSX" en la Fase 1.3. La IA marcará esta tarea como Requerida u Omitida.',
        role: 'Cliente',
        status: 'pending',
        isConditional: true,
        conditionalBranch: 'avi_vds',
        conditionNote: 'Condicional: Se torna mandatoria y prioritaria si en Fase 1.3 no se detecta clúster NSX-T.',
        executionSteps: [
          'Descargar la OVA de Avi Controller (versión recomendada: 22.1.x o superior certificada para vSphere 8).',
          'Gestionar la licencia Basic de Avi (incluida con licencias de vSphere para Tanzu).',
          'Mantener la OVA en la jumpbox en caso de que la Fase 1 confirme que la red se ejecutará sobre VDS sin NSX.'
        ],
        commands: [],
        guiBreadcrumb: 'Customer Connect > VMware NSX Advanced Load Balancer',
        requiredEvidence: 'Archivo OVA de Avi Controller descargado y licencia Basic identificada.',
        expectedResult: 'OVA de Avi Controller lista para ser desplegada en caso de ausencia de NSX.',
        warnings: [
          'Si la infraestructura cuenta con NSX-T nativo, este paso se omitirá automáticamente.'
        ],
        sampleEvidence: [
          {
            label: 'OVA de Avi Controller disponible',
            content: `Ubicación: D:\\Tanzu_Binaries\\Avi_Load_Balancer\\controller-22.1.4-9189.ova
Tamaño: 6.8 GB
Licencia: Tanzu Basic Edition License Key aplicada.`
          }
        ]
      }
    ]
  },
  {
    id: 'phase_1',
    number: 1,
    title: 'Fase 1: Descubrimiento y Verificación "As-Is" (Read-Only)',
    objective: 'Ejecutar comandos de solo lectura para relevar el estado real de la plataforma HCI y garantizar el cumplimiento estricto de prerrequisitos técnicos.',
    defaultRole: 'Ingeniero de Implementación',
    isBlocked: false,
    tasks: [
      {
        id: '1.1.1',
        phaseId: 'phase_1',
        subCategory: '1.1 Cómputo',
        title: 'Verificar Versiones ESXi y Homogeneidad',
        description: 'Conectarse por PowerCLI al vCenter para auditar los 3 hosts físicos del clúster HCI. Comprobar que las versiones y números de build de ESXi sean exactamente homogéneas y compatibles con Tanzu.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Abrir sesión de PowerCLI y autenticarse en el vCenter: `Connect-VIServer -Server <vcenter_fqdn>`',
          'Ejecutar script para obtener información de cada host ESXi.',
          'Verificar que la versión sea al menos ESXi 7.0 Update 3 o superior (recomendado 8.0 Update 2) y que los 3 hosts tengan el mismo build exacto.'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Comando PowerCLI de auditoría de hosts',
            command: 'Get-VMHost | Select-Object Name, Version, Build, PowerState, ConnectionState | Format-Table -AutoSize',
            explanation: 'Lista los 3 hosts físicos del clúster con su versión de hipervisor.'
          }
        ],
        guiBreadcrumb: 'vCenter > Clúster HCI > Hosts tab',
        requiredEvidence: 'Output de texto/CSV del comando `Get-VMHost | Select Name, Version, Build`.',
        expectedResult: '3 hosts con la misma versión y build soportada para Tanzu.',
        sampleEvidence: [
          {
            label: 'Auditoría 3 Hosts ESXi 8.0u2 Homogéneos',
            content: `Name                     Version Build    PowerState ConnectionState
----                     ------- -----    ---------- ---------------
esxi-hci-01.corp.local   8.0.2   23305546 PoweredOn  Connected
esxi-hci-02.corp.local   8.0.2   23305546 PoweredOn  Connected
esxi-hci-03.corp.local   8.0.2   23305546 PoweredOn  Connected`
          }
        ]
      },
      {
        id: '1.1.2',
        phaseId: 'phase_1',
        subCategory: '1.1 Cómputo',
        title: 'Validar DRS (Fully Automated) y HA Habilitado',
        description: 'Confirmar que el clúster vSphere tenga habilitado DRS en modo "Totalmente Automatizado" (Fully Automated) y vSphere High Availability (HA) activo, requisitos indispensables para que el Supervisor Cluster posicione automáticamente las VMs de Control Plane.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Ejecutar comando PowerCLI de validación del clúster.',
          'Confirmar que `DrsEnabled` sea True y `DrsAutomationLevel` sea "FullyAutomated".',
          'Confirmar que `HAEnabled` sea True.'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Comando PowerCLI para DRS y HA',
            command: 'Get-Cluster | Select-Object Name, DrsEnabled, DrsAutomationLevel, HAEnabled, VSanEnabled | Format-List',
            explanation: 'Verifica los servicios esenciales de clúster para Tanzu.'
          }
        ],
        guiBreadcrumb: 'vCenter > Clúster > Configure > Services > vSphere DRS / vSphere HA',
        requiredEvidence: 'Output de PowerCLI confirmando DrsAutomationLevel=FullyAutomated y HAEnabled=True.',
        expectedResult: 'DRS en Fully Automated y HA activo en el clúster HCI.',
        warnings: [
          'Si DRS está en Partially Automated o Manual, el asistente de Workload Management no permitirá continuar.'
        ],
        sampleEvidence: [
          {
            label: 'Salida de Cluster DRS/HA Conforme',
            content: `Name               : Cluster-HCI-SimpliVity
DrsEnabled         : True
DrsAutomationLevel : FullyAutomated
HAEnabled          : True
VSanEnabled        : False`
          }
        ]
      },
      {
        id: '1.1.3',
        phaseId: 'phase_1',
        subCategory: '1.1 Cómputo',
        title: 'Validar Estricta Sincronización de Tiempo (NTP)',
        description: 'Tanzu y etcd son altamente sensibles a desincronizaciones de tiempo. Conectarse por SSH a vCenter Server Appliance (VCSA) y a los 3 hosts ESXi para ejecutar `ntpq -p` y comprobar que el offset sea mínimo (<100ms) y que apunten a los mismos NTP servers corporativos.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Conectarse por SSH a vCenter: `ssh root@vcenter_ip` y ejecutar `ntpq -p` o `chronyc tracking`.',
          'Conectarse por SSH a esxi-01, esxi-02 y esxi-03 y ejecutar `ntpq -p`.',
          'Revisar las columnas `offset`, `jitter` y el asterisco `*` en el peer de sincronización activo.'
        ],
        commands: [
          {
            type: 'ssh',
            label: 'Comando SSH en vCenter y ESXi',
            command: 'ntpq -p',
            explanation: 'Muestra los peers NTP, estrato, retardo, offset y jitter.'
          }
        ],
        guiBreadcrumb: 'vCenter SSH / ESXi DCUI o SSH Shell',
        requiredEvidence: 'Captura o log de salida de `ntpq -p` en vCenter y los 3 hosts ESXi.',
        expectedResult: 'Offset menor a 50ms y peer NTP alcanzable con asterisco de sincronización.',
        warnings: [
          'Un desfase >1s provocará fallos intermitentes de TLS y expiración de certificados en los pods del Supervisor.'
        ],
        sampleEvidence: [
          {
            label: 'Salida NTP Sincronizada Correctamente',
            content: `[root@vcenter:~#] ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
*ntp1.corp.local 10.0.10.1        2 u   45   64  377    0.412   -0.082   0.025
+ntp2.corp.local 10.0.10.2        2 u   51   64  377    0.485    0.114   0.038

[root@esxi-hci-01:~#] ntpq -p
*ntp1.corp.local 10.0.10.1        2 u   12   64  377    0.395   -0.075   0.021`
          }
        ]
      },
      {
        id: '1.2.1',
        phaseId: 'phase_1',
        subCategory: '1.2 Almacenamiento',
        title: 'Verificar Estado VASA Provider de HPE SimpliVity',
        description: 'Ingresar a vCenter y validar que el VASA Provider registrado por las Virtual Controllers (OVC) de HPE SimpliVity se encuentre en estado "Online" y "Active", permitiendo el aprovisionamiento dinámico SPBM de volúmenes persistentes en Kubernetes.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'En vSphere Client, seleccionar el objeto vCenter en la raíz.',
          'Ir a la pestaña Configure -> Storage Providers.',
          'Verificar la presencia del proveedor "HPE SimpliVity VASA Provider".',
          'Comprobar que el Status indique "Online" y Storage Provider Status "Active".'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Listar Storage Providers en vCenter',
            command: 'Get-View -ViewType StoragePod | Out-Null; Get-VIObjectByVIProperties -Type StorageProvider | Select-Object Name, Active, ConnectedStatus',
            explanation: 'Obtiene el estado de conexión de los proveedores VASA registrados.'
          }
        ],
        guiBreadcrumb: 'vCenter > Configure > Storage Providers',
        requiredEvidence: 'Captura de pantalla de vSphere Client mostrando el Storage Provider de SimpliVity en estado Online y Active.',
        expectedResult: 'VASA Provider HPE SimpliVity en estado Online y Active.',
        sampleEvidence: [
          {
            label: 'Estado VASA SimpliVity OK',
            content: `Storage Provider Name: HPE SimpliVity VASA Provider
Vendor: Hewlett Packard Enterprise
Status: Online
Active: True
Supported Profile Types: vSphere APIs for Storage Awareness (VASA 3.0)
URL: https://192.168.100.50:443/vasa/services/vasaService`
          }
        ]
      },
      {
        id: '1.2.2',
        phaseId: 'phase_1',
        subCategory: '1.2 Almacenamiento',
        title: 'Validar Capacidad de Datastores NFS de SimpliVity',
        description: 'Listar los datastores NFS presentados por las OVCs de HPE SimpliVity y validar la capacidad total y espacio libre para alojar las VMs del Supervisor Cluster, nodos TKG y Persistent Volume Claims (PVC).',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Ejecutar script PowerCLI para filtrar datastores de tipo NFS.',
          'Verificar que exista al menos 500GB a 1TB de espacio libre garantizado para el despliegue inicial de Tanzu y cargas de trabajo.',
          'Verificar que los datastores estén montados de manera consistente en los 3 hosts.'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Listar Datastores NFS de SimpliVity',
            command: 'Get-Datastore | Where-Object {$_.Type -eq "NFS"} | Select-Object Name, CapacityGB, FreeSpaceGB, State | Format-Table -AutoSize',
            explanation: 'Muestra datastores NFS con capacidad y espacio libre.'
          }
        ],
        guiBreadcrumb: 'vCenter > Storage View > Datastores',
        requiredEvidence: 'Output de PowerCLI con listado de datastores NFS, capacidad y espacio disponible.',
        expectedResult: 'Datastores NFS SimpliVity con espacio libre suficiente (>500 GB recomendados).',
        sampleEvidence: [
          {
            label: 'Datastores NFS SimpliVity con Espacio Adecuado',
            content: `Name                   CapacityGB FreeSpaceGB State
----                   ---------- ----------- -----
SVT-DS-K8S-GOLD-01        2048.00     1420.50 Accessible
SVT-DS-SYSTEM-01          1024.00      680.12 Accessible`
          }
        ]
      },
      {
        id: '1.2.3',
        phaseId: 'phase_1',
        subCategory: '1.2 Almacenamiento',
        title: 'Viabilidad de Tags de Almacenamiento para SPBM',
        description: 'Verificar si existen etiquetas (vSphere Tags) asignadas a los datastores de SimpliVity o si la cuenta de servicio cuenta con permisos para crear una categoría de tags (ej. "Storage-Tier") y asignarla a los datastores objetivo.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Revisar en vCenter -> Tags & Custom Attributes las categorías existentes.',
          'Confirmar que se puede crear la categoría "Tanzu-Storage" y tag "SimpliVity-Gold".',
          'Asignar el tag a los datastores NFS validados en 1.2.2.'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Listar Tags de Datastore en PowerCLI',
            command: 'Get-TagAssignment -Entity (Get-Datastore | Where-Object {$_.Type -eq "NFS"})',
            explanation: 'Comprueba los tags actuales asignados a los datastores.'
          }
        ],
        guiBreadcrumb: 'vCenter > Menu > Tags & Custom Attributes',
        requiredEvidence: 'Confirmación de tags existentes o permisos para crear categorías de almacenamiento en vCenter.',
        expectedResult: 'Capacidad de etiquetar datastores para formular Storage Policies (SPBM).',
        sampleEvidence: [
          {
            label: 'Tags de Datastore Verificados',
            content: `Category: Storage-Tier
Tag: SimpliVity-FastStorage
Assigned to Datastore: SVT-DS-K8S-GOLD-01
Permisos: Role Administrator tiene derechos completos para 'Storage views' y 'Profile-driven storage'.`
          }
        ]
      },
      {
        id: '1.3.1',
        phaseId: 'phase_1',
        subCategory: '1.3 Redes (PUNTO CRÍTICO IA)',
        title: 'Check de NSX (SDN): Detección de Clúster NSX-T',
        description: 'CRÍTICO: Validar en vCenter si existe un clúster de NSX Manager desplegado y nodos Edge configurados. ESTE RESULTADO DETERMINARÁ TODA LA ARQUITECTURA DE RED Y RAMAS POSTERIORES (Opción A: NSX Nativo vs Opción B: Avi Load Balancer sobre VDS).',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        isConditional: true,
        conditionNote: 'Punto de bifurcación: La IA analizará la evidencia para determinar si se activa la Opción A o la Opción B.',
        executionSteps: [
          'Ingresar al menú principal de vSphere Client y buscar el acceso directo a "NSX" o "Networking".',
          'En el inventario de VMs, buscar si existen máquinas virtuales con prefijos `nsx-manager` o `nsx-edge`.',
          'Ejecutar script PowerCLI para consultar si existe extensión o plugin com.vmware.nsx registrado en vCenter.',
          'Subir la evidencia a la App para que el motor de IA evalúe la arquitectura.'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Comprobar VMs de NSX y Extensiones en vCenter',
            command: 'Get-VM | Where-Object {$_.Name -match "nsx|edge"} | Select-Object Name, PowerState, Host; Get-View ExtensionManager | Select-Object -ExpandProperty ExtensionList | Where-Object {$_.Key -match "nsx"} | Select-Object Key',
            explanation: 'Detecta si hay VMs de NSX Manager/Edge o plugins registrados en vCenter.'
          }
        ],
        guiBreadcrumb: 'vCenter > Menu > NSX / VMs & Templates',
        requiredEvidence: 'Captura de pantalla o salida de consola que demuestre de forma inequívoca la existencia o ausencia de clúster NSX en el vCenter.',
        expectedResult: 'Detección clara de NSX Presente (Opción A) o Sin NSX (Opción B: Avi + VDS).',
        warnings: [
          'Esta tarea disparará la reconfiguración automática del Plan de Proyecto en Fase 2 y Fase 3.'
        ],
        sampleEvidence: [
          {
            label: 'Muestra 1: SIN NSX (Activa Avi + VDS)',
            content: `PowerCLI C:\\> Get-VM | Where-Object {$_.Name -match "nsx|edge"}
(0 objects returned - No NSX Manager or Edge VMs found on cluster)

PowerCLI C:\\> Get-View ExtensionManager | Select-Object -ExpandProperty ExtensionList | Where-Object {$_.Key -match "nsx"}
(No registered extensions found for NSX)

Conclusión: La infraestructura NO cuenta con VMware NSX desplegado. Se utilizará Virtual Distributed Switch (VDS) estándar.`
          },
          {
            label: 'Muestra 2: CON NSX (Activa Tier-0/1)',
            content: `PowerCLI C:\\> Get-VM | Where-Object {$_.Name -match "nsx|edge"}
Name                 PowerState Host
----                 ---------- ----
nsx-mgr-01.corp      PoweredOn  esxi-hci-01.corp.local
nsx-mgr-02.corp      PoweredOn  esxi-hci-02.corp.local
nsx-mgr-03.corp      PoweredOn  esxi-hci-03.corp.local
nsx-edge-01          PoweredOn  esxi-hci-01.corp.local
nsx-edge-02          PoweredOn  esxi-hci-02.corp.local

Extension Key: com.vmware.nsx.management
Cluster Status: UP / Healthy (NSX-T Data Center 4.1.2.0)`
          }
        ]
      },
      {
        id: '1.3.2',
        phaseId: 'phase_1',
        subCategory: '1.3 Redes',
        title: 'Check de VDS (Distributed Switch) y MTU',
        description: 'Revisar la versión y configuración de los vSphere Distributed Switches (VDS). Tanzu requiere VDS 7.0 o superior. Verificar el valor de MTU configurado en el switch (1500 estándar o 1600+ en caso de overlays).',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Ejecutar script PowerCLI para auditar los switches distribuidos.',
          'Verificar que la versión de VDS sea 7.0 o 8.0.',
          'Revisar si la MTU está en 1500 (adecuada para VDS con Avi LB) o si soporta tramas jumbo (1600-9000).'
        ],
        commands: [
          {
            type: 'powercli',
            label: 'Auditoría de VDS en PowerCLI',
            command: 'Get-VDSwitch | Select-Object Name, Version, Mtu, NumPorts | Format-Table -AutoSize',
            explanation: 'Muestra los VDS configurados con su versión y tamaño de MTU.'
          }
        ],
        guiBreadcrumb: 'vCenter > Networking > Distributed Switches > Configure > Properties',
        requiredEvidence: 'Output de PowerCLI con nombre, versión y MTU de los Distributed Switches.',
        expectedResult: 'VDS versión 7.0+ con MTU uniforme entre todos los hosts ESXi.',
        sampleEvidence: [
          {
            label: 'Salida de VDS Conforme',
            content: `Name             Version Mtu  NumPorts
----             ------- ---  --------
VDS-HCI-PROD     8.0.0   1500      128`
          }
        ]
      },
      {
        id: '1.3.3',
        phaseId: 'phase_1',
        subCategory: '1.3 Redes',
        title: 'Check de DNS: Validación de Resolución Directa (A) e Inversa (PTR)',
        description: 'Confirmar que los servidores DNS internos resuelvan correctamente vCenter, hosts ESXi y que el cliente permita la creación de registros A y PTR para los futuros componentes de Tanzu (Control Plane y Balanceador).',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Ejecutar `nslookup` apuntando a la IP y FQDN del vCenter Server.',
          'Ejecutar `nslookup` para los 3 hosts ESXi.',
          'Validar que la respuesta sea autoritativa y el PTR coincida exactamente con el registro A.'
        ],
        commands: [
          {
            type: 'bash',
            label: 'Comandos de resolución DNS',
            command: 'nslookup vcenter.corp.local && nslookup 10.0.10.20 && nslookup esxi-hci-01.corp.local',
            explanation: 'Comprueba registros A y registros reversos PTR.'
          }
        ],
        guiBreadcrumb: 'Jumpbox Command Prompt / Terminal',
        requiredEvidence: 'Log de ejecución de los comandos nslookup verificando registros directos e inversos.',
        expectedResult: 'Resolución bidireccional limpia y sin fallos NXDOMAIN.',
        sampleEvidence: [
          {
            label: 'Salida DNS Limpia',
            content: `C:\\> nslookup vcenter.corp.local
Server:  dc01.corp.local
Address: 10.0.10.5
Name:    vcenter.corp.local
Address: 10.0.10.20

C:\\> nslookup 10.0.10.20
Server:  dc01.corp.local
Address: 10.0.10.5
Name:    vcenter.corp.local`
          }
        ]
      },
      {
        id: '1.4.1',
        phaseId: 'phase_1',
        subCategory: '1.4 Observabilidad',
        title: 'Validar Estado de VMware Aria Operations (vROps)',
        description: 'Ingresar a la consola web de Aria Operations. Verificar la versión del producto y confirmar que el adaptador para el vCenter actual se encuentra en estado "Collecting" y sin alertas activas.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Acceder a la URL de Aria Operations con credenciales administrativas.',
          'Ir a Data Sources -> Integrations -> VMware vCenter.',
          'Comprobar que el adaptador de vCenter indique "Status: Data Receiving" y "Collection State: Collecting".'
        ],
        commands: [],
        guiBreadcrumb: 'Aria Operations > Administration > Integrations > Accounts',
        requiredEvidence: 'Captura de pantalla de Aria Operations mostrando el adaptador de vCenter en estado Collecting.',
        expectedResult: 'Aria Operations conectado y recolectando telemetría del vCenter Server.',
        sampleEvidence: [
          {
            label: 'Adaptador Aria Ops Conectado',
            content: `Aria Operations Version: 8.14.0 Enterprise
Integration: vCenter Server Adapter (vc-prod)
Status: Data Receiving
Collection State: Collecting
Objects Monitored: 3 Hosts, 42 VMs, 4 Datastores`
          }
        ]
      }
    ]
  },
  {
    id: 'phase_2',
    number: 2,
    title: 'Fase 2: Diseño y Matriz de Prerrequisitos (To-Be)',
    objective: 'Con los datos obtenidos en la Fase 1, definir la arquitectura exacta de red/almacenamiento y solicitar al cliente las configuraciones de red y seguridad.',
    defaultRole: 'IA / Arquitecto',
    isBlocked: false,
    tasks: [
      {
        id: '2.1',
        phaseId: 'phase_2',
        subCategory: '2.1 Arquitectura de Red',
        title: 'Definición de Arquitectura de Red y Balanceo',
        description: 'Definir el modelo de enrutamiento y balanceo. Si se descubrió NSX se diseñará sobre Tier-0/1 nativo (Opción A). Si no hay NSX, se diseñará sobre VDS con Avi Load Balancer (Opción B).',
        role: 'IA / Arquitecto',
        status: 'pending',
        isConditional: true,
        conditionNote: 'Adaptativo: Su contenido y entregable cambian según el Check de NSX (1.3.1).',
        executionSteps: [
          'Evaluar la decisión tomada por el motor de IA en la tarea 1.3.1.',
          'Generar diagrama y especificación técnica de la topología seleccionada.',
          'Validar requerimientos de routing hacia el firewall perimetral corporativo.'
        ],
        commands: [],
        guiBreadcrumb: 'Documentación de Arquitectura de Solución',
        requiredEvidence: 'Documento de especificación arquitectónica validado (Diagrama lógico de red).',
        expectedResult: 'Topología de red aprobada por el equipo de networking del cliente.',
        sampleEvidence: [
          {
            label: 'Diseño Opción B (Avi sobre VDS)',
            content: `[ARQUITECTURA SELECCIONADA: OPCIÓN B - AVI LOAD BALANCER SOBRE VDS]
- Control Plane: 3 VMs Supervisor Cluster en Red de Management (VLAN 100).
- Balanceador: Avi Controller OVA en Red de Management; Service Engines en VLAN de Workload.
- Ingress VIP: VLAN 200 (Frontend) anunciada hacia el Core Switch corporativo.
- Sin requerimiento de Geneve Overlays ni NSX Edges.`
          }
        ]
      },
      {
        id: '2.2',
        phaseId: 'phase_2',
        subCategory: '2.2 Matriz de IPs',
        title: 'Entrega y Validación de Planilla de IPs al Cliente',
        description: 'Solicitar y validar la asignación de CIDRs estáticos y redes para Management, Frontend/VIPs (Ingress), Workload (Nodos TKG) y Rangos Internos no enrutables (Pods y Services).',
        role: 'Cliente',
        status: 'pending',
        executionSteps: [
          'Completar en la pestaña "Matriz de IPs y Red" de esta App todos los campos requeridos.',
          'Verificar que el rango Frontend cuente con al menos 16 a 32 IPs consecutivas para balanceo.',
          'Verificar que los rangos internos (10.244.0.0/16 y 10.96.0.0/12) no colisionen con la red privada del cliente.'
        ],
        commands: [],
        guiBreadcrumb: 'Pestaña Matriz de IPs en la App',
        requiredEvidence: 'Matriz de IPs completada en la plataforma sin alertas de solapamiento.',
        expectedResult: 'Todas las subredes y gateways asignados formalmente por el cliente.',
        sampleEvidence: [
          {
            label: 'Matriz de IPs Aprobada',
            content: `Management: 10.100.10.0/24 (VLAN 100, GW 10.100.10.1)
Frontend VIPs: 10.100.20.0/27 (VLAN 200, GW 10.100.20.1)
Workload Nodes: 10.100.30.0/24 (VLAN 300, GW 10.100.30.1)
Pods CIDR: 10.244.0.0/16
Services CIDR: 10.96.0.0/12`
          }
        ]
      },
      {
        id: '2.3',
        phaseId: 'phase_2',
        subCategory: '2.3 Storage Policy',
        title: 'Definición de Storage Policy SPBM para SimpliVity',
        description: 'Crear en documento la política SPBM exacta que apuntará a los datastores NFS de SimpliVity basada en los tags identificados en 1.2.3.',
        role: 'IA / Arquitecto',
        status: 'pending',
        executionSteps: [
          'Definir el nombre de la política (ej. `tanzu-simplivity-gold-policy`).',
          'Configurar regla basada en Tags: `Category: Storage-Tier`, `Tag: SimpliVity-Gold`.',
          'Validar que todos los datastores NFS de SimpliVity compatibles queden seleccionados bajo la política.'
        ],
        commands: [],
        guiBreadcrumb: 'vCenter > Policies and Profiles > VM Storage Policies',
        requiredEvidence: 'Definición formal de la regla SPBM para su creación en Fase 3.',
        expectedResult: 'Especificación de Storage Policy aprobada.',
        sampleEvidence: [
          {
            label: 'Especificación SPBM',
            content: `Policy Name: tanzu-simplivity-sc
Rule: Tag-based placement
Category: Storage-Tier
Tags: SimpliVity-FastStorage
Matching Datastores: SVT-DS-K8S-GOLD-01 (1.4 TB libres)`
          }
        ]
      }
    ]
  },
  {
    id: 'phase_3',
    number: 3,
    title: 'Fase 3: Ejecución de la Implementación',
    objective: 'Despliegue y configuración de los componentes técnicos una vez aprobada la Fase 2.',
    defaultRole: 'Ingeniero de Implementación',
    isBlocked: true,
    blockReason: 'Bloqueada hasta que la Matriz de IPs (Fase 2.2) y el Diseño (Fase 2.1) estén validados.',
    tasks: [
      {
        id: '3.1',
        phaseId: 'phase_3',
        subCategory: '3.1 Red y Balanceo',
        title: 'Preparación y Despliegue de Red (Condicional)',
        description: 'Opción A: Configurar NSX (Tier-0, BGP, IP Pools) | Opción B: Desplegar OVA de Avi Controller, configurar vCenter Cloud y Service Engines.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        isConditional: true,
        conditionNote: 'Ejecuta 3.1A (NSX) o 3.1B (Avi Controller) según la arquitectura resuelta.',
        executionSteps: [
          'Si Opción B: Desplegar la OVA de Avi Controller en la red de Management con IP estática.',
          'Completar el wizard inicial de Avi (password admin, DNS, NTP).',
          'Configurar vCenter Cloud en Avi y crear Service Engine Group.',
          'Crear Network VIP pool utilizando el rango Frontend de la Fase 2.2.'
        ],
        commands: [],
        guiBreadcrumb: 'Avi Controller Web UI (https://<avi_ip>) o NSX Manager',
        requiredEvidence: 'Captura del dashboard del Balanceador en estado verde / Cloud conectada.',
        expectedResult: 'Balanceador de carga 100% operativo y listo para interactuar con Tanzu.',
        sampleEvidence: [
          {
            label: 'Avi Controller Operativo',
            content: `Avi Controller 22.1.4 Status: Healthy
Cloud: Default-Cloud (vCenter vc-prod connected)
Service Engines: 2 deployed and active
VIP Network: Frontend-VLAN200 (IP Pool: 10.100.20.10 - 10.100.20.30)`
          }
        ]
      },
      {
        id: '3.2.1',
        phaseId: 'phase_3',
        subCategory: '3.2 Almacenamiento',
        title: 'Crear Tags y VM Storage Policy en vCenter',
        description: 'Asignar los tags a los datastores NFS de SimpliVity y crear la VM Storage Policy en vCenter según lo definido en 2.3.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Ir a vCenter -> Policies and Profiles -> VM Storage Policies -> Create.',
          'Nombrar la política `tanzu-simplivity-sc`.',
          'En regla de ubicación, seleccionar "Enable tag based placement rules".',
          'Guardar y verificar que el datastore NFS de SimpliVity aparezca como "Compatible".'
        ],
        commands: [],
        guiBreadcrumb: 'vCenter > Policies and Profiles > VM Storage Policies',
        requiredEvidence: 'Captura de vCenter mostrando la política SPBM con datastores compatibles.',
        expectedResult: 'Política SPBM creada y asociada a los datastores SimpliVity.',
        sampleEvidence: [
          {
            label: 'Storage Policy Creada',
            content: `Policy Name: tanzu-simplivity-sc
Status: Compliant
Compatible Datastores: SVT-DS-K8S-GOLD-01`
          }
        ]
      },
      {
        id: '3.3.1',
        phaseId: 'phase_3',
        subCategory: '3.3 Supervisor Cluster',
        title: 'Configurar Content Library con imágenes TKr',
        description: 'Crear una Content Library en vCenter y subir las OVAs de Tanzu Kubernetes Releases (descargadas en 0.2).',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'En vCenter -> Content Libraries -> Create.',
          'Nombrar la biblioteca `Tanzu-K8s-Releases`.',
          'Subir los templates OVA de Kubernetes (Photon OS y Ubuntu).',
          'Verificar que el estado de sincronización sea completo.'
        ],
        commands: [],
        guiBreadcrumb: 'vCenter > Menu > Content Libraries',
        requiredEvidence: 'Content Library con templates TKr cargados y sincronizados.',
        expectedResult: 'Biblioteca de contenido lista para el Supervisor Cluster.',
        sampleEvidence: [
          {
            label: 'Content Library Lista',
            content: `Library: Tanzu-K8s-Releases
Items:
- photon-3-kube-v1.27.6+vmware.1
- ubuntu-2004-kube-v1.26.8+vmware.1
Status: Synced`
          }
        ]
      },
      {
        id: '3.3.2',
        phaseId: 'phase_3',
        subCategory: '3.3 Supervisor Cluster',
        title: 'Ejecutar Wizard de Workload Management',
        description: 'En vCenter, iniciar el wizard de Workload Management para habilitar el Supervisor Cluster sobre el clúster HCI SimpliVity.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'En vSphere Client, ir a Workload Management -> Get Started.',
          'Seleccionar vCenter Server y Clúster HCI SimpliVity.',
          'Configurar plano de control (Small o Medium) y Storage Policy (3.2.1).',
          'Configurar networking ingresando los datos de la Matriz de IPs (Fase 2.2) y el balanceador (Avi o NSX).',
          'Asociar la Content Library (3.3.1) y confirmar el despliegue.'
        ],
        commands: [],
        guiBreadcrumb: 'vCenter > Menu > Workload Management',
        requiredEvidence: 'Captura del wizard completado y proceso de despliegue en marcha.',
        expectedResult: 'Supervisor Cluster iniciando el aprovisionamiento de las 3 VMs de control plane.',
        sampleEvidence: [
          {
            label: 'Wizard Lanzado',
            content: `Supervisor Cluster: Cluster-HCI-SimpliVity
Control Plane Size: Small
Storage Policy: tanzu-simplivity-sc
Network: VDS with Avi Load Balancer
Status: Initializing (Creating Control Plane VMs)`
          }
        ]
      },
      {
        id: '3.3.3',
        phaseId: 'phase_3',
        subCategory: '3.3 Supervisor Cluster',
        title: 'Validación de Estado "Running" del Supervisor Cluster',
        description: 'Esperar a que el estado del Supervisor Cluster pase a "Running" y verificar la creación exitosa de las 3 VMs del Control Plane.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Monitorear la pestaña Workload Management -> Clusters.',
          'Confirmar que "Config Status" sea "Running" y "Kubernetes Status" sea "Running".',
          'Comprobar la IP del Control Plane API Endpoint asignada.'
        ],
        commands: [],
        guiBreadcrumb: 'vCenter > Workload Management > Clusters',
        requiredEvidence: 'Captura de vCenter mostrando Config Status=Running y Control Plane IP activa.',
        expectedResult: 'Supervisor Cluster 100% operativo.',
        sampleEvidence: [
          {
            label: 'Supervisor Cluster Running',
            content: `Cluster: Cluster-HCI-SimpliVity
Config Status: Running
Kubernetes Status: Running
Control Plane Node IP: 10.100.20.15
API Endpoint: https://10.100.20.15:6443`
          }
        ]
      },
      {
        id: '3.4.1',
        phaseId: 'phase_3',
        subCategory: '3.4 Namespaces y TKG',
        title: 'Crear vSphere Namespace de Prueba',
        description: 'Crear un Namespace de vSphere (ej. `demo-k8s`), asociar la Storage Policy de SimpliVity y otorgar permisos de acceso.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'En Workload Management -> Namespaces -> Create Namespace.',
          'Nombrar el namespace `demo-k8s`.',
          'Asignar permisos a la cuenta de usuario/administrador.',
          'Asociar la Storage Policy `tanzu-simplivity-sc` para permitir aprovisionamiento de PVCs.'
        ],
        commands: [],
        guiBreadcrumb: 'vCenter > Workload Management > Namespaces',
        requiredEvidence: 'Namespace `demo-k8s` creado con Storage Policy y permisos asociados.',
        expectedResult: 'Namespace operativo para desplegar clústeres TKG.',
        sampleEvidence: [
          {
            label: 'Namespace Creado',
            content: `Namespace: demo-k8s
Cluster: Cluster-HCI-SimpliVity
Storage Policies: tanzu-simplivity-sc (Limit: 500GB)
Permissions: vsphere.local\\admin (Owner)`
          }
        ]
      },
      {
        id: '3.4.2',
        phaseId: 'phase_3',
        subCategory: '3.4 Namespaces y TKG',
        title: 'Autenticación CLI vía `kubectl vsphere login`',
        description: 'Desde la jumpbox del administrador, autenticarse en el Supervisor Cluster utilizando el plugin de vSphere para kubectl.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Abrir terminal en la jumpbox.',
          'Ejecutar comando de login apuntando a la IP del Control Plane API Endpoint.',
          'Cambiar el contexto de Kubernetes hacia el namespace `demo-k8s`.'
        ],
        commands: [
          {
            type: 'kubectl',
            label: 'Comando de login a Tanzu',
            command: 'kubectl vsphere login --server=https://<control_plane_ip> --vsphere-username=administrator@vsphere.local --insecure-skip-tls-verify',
            explanation: 'Obtiene el token de autenticación del Supervisor Cluster.'
          },
          {
            type: 'kubectl',
            label: 'Cambiar al contexto del Namespace',
            command: 'kubectl config use-context demo-k8s',
            explanation: 'Selecciona el namespace de trabajo.'
          }
        ],
        guiBreadcrumb: 'Jumpbox CLI',
        requiredEvidence: 'Output de terminal demostrando login exitoso y listado de pods del Supervisor.',
        expectedResult: 'Sesión activa de kubectl contra el Supervisor Cluster.',
        sampleEvidence: [
          {
            label: 'Login Exitoso en CLI',
            content: `Logged in successfully.
You have access to the following contexts:
   10.100.20.15
   demo-k8s

Switched to context "demo-k8s".
kubectl get nodes
NAME                               STATUS   ROLES                  AGE
420b9a1d-supervisor-cp-01          Ready    control-plane,master   45m
420b9a1d-supervisor-cp-02          Ready    control-plane,master   42m
420b9a1d-supervisor-cp-03          Ready    control-plane,master   40m`
          }
        ]
      },
      {
        id: '3.4.3',
        phaseId: 'phase_3',
        subCategory: '3.4 Namespaces y TKG',
        title: 'Desplegar Clúster Tanzu Kubernetes Grid (TKG) de Prueba',
        description: 'Crear un archivo YAML de manifiesto y desplegar el primer Tanzu Kubernetes Cluster con 1 nodo Control Plane y 2 nodos Worker en el datastore SimpliVity.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'Crear archivo `tkg-cluster-01.yaml` definiendo versión de Kubernetes, topología (1 CP, 2 Workers) y Storage Class.',
          'Ejecutar `kubectl apply -f tkg-cluster-01.yaml`.',
          'Monitorear la creación de las VMs y verificar que todos los nodos pasen al estado "Ready".'
        ],
        commands: [
          {
            type: 'kubectl',
            label: 'Aplicar manifiesto y verificar clúster TKG',
            command: 'kubectl apply -f tkg-cluster-01.yaml && kubectl get tanzukubernetescluster -w',
            explanation: 'Aprovisiona el clúster de Kubernetes para usuarios.'
          }
        ],
        guiBreadcrumb: 'Jumpbox CLI / vCenter VMs',
        requiredEvidence: 'Output de `kubectl get tanzukubernetescluster` con PHASE=Ready.',
        expectedResult: 'Clúster TKG aprovisionado y operativo sobre HPE SimpliVity.',
        sampleEvidence: [
          {
            label: 'Clúster TKG en Estado Ready',
            content: `NAME             CONTROL PLANE   WORKER   DISTRIBUTION                     AGE   PHASE
tkg-cluster-01   1               2        v1.27.6+vmware.1-tkg.1           18m   Ready`
          }
        ]
      },
      {
        id: '3.5.1',
        phaseId: 'phase_3',
        subCategory: '3.5 Observabilidad',
        title: 'Instalar Management Pack for Kubernetes en Aria Ops',
        description: 'Instalar el archivo .pak (descargado en 0.4) en la consola de VMware Aria Operations.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'En Aria Operations, ir a Administration -> Solutions -> Repository.',
          'Hacer clic en "Add/Upgrade" y seleccionar el archivo .pak descargado.',
          'Aceptar el contrato de licencia y esperar la finalización de la instalación.'
        ],
        commands: [],
        guiBreadcrumb: 'Aria Operations > Administration > Solutions > Repository',
        requiredEvidence: 'Captura de pantalla de Aria Operations mostrando el Management Pack instalado y activo.',
        expectedResult: 'Management Pack for Kubernetes disponible en el repositorio.',
        sampleEvidence: [
          {
            label: 'Management Pack Instalado',
            content: `Solution: VMware Aria Operations Management Pack for Kubernetes
Version: 2.3.0
Status: Installed and Activated`
          }
        ]
      },
      {
        id: '3.5.2',
        phaseId: 'phase_3',
        subCategory: '3.5 Observabilidad',
        title: 'Configurar Adaptador K8s y Verificar Métricas',
        description: 'Configurar la cuenta de integración en Aria Operations apuntando al API Endpoint del Supervisor o clúster TKG y verificar la recepción de métricas y dashboards.',
        role: 'Ingeniero de Implementación',
        status: 'pending',
        executionSteps: [
          'En Aria Operations, ir a Data Sources -> Integrations -> Kubernetes.',
          'Crear una nueva instancia de adaptador con la URL del API Server y Token de ServiceAccount.',
          'Validar la conexión y confirmar que comiencen a recolectarse métricas de nodos, pods y namespaces.'
        ],
        commands: [],
        guiBreadcrumb: 'Aria Operations > Dashboards > Kubernetes',
        requiredEvidence: 'Captura del dashboard de Kubernetes en Aria Ops mostrando salud y consumo de CPU/Memoria.',
        expectedResult: 'Observabilidad completa de Tanzu en Aria Operations.',
        sampleEvidence: [
          {
            label: 'Dashboard Aria Ops Kubernetes Activo',
            content: `Adapter: Kubernetes Adapter (k8s-tkg-prod)
Status: Data Receiving (100% collecting)
Dashboards: Kubernetes Cluster Overview, Workloads Performance, Namespaces Capacity`
          }
        ]
      }
    ]
  }
];

export const initialNetworkMatrix: ProjectState['networkMatrix'] = [
  {
    id: 'net_mgmt',
    networkType: 'management',
    name: 'Red de Gestión (Management)',
    description: 'Subred para vCenter, hosts ESXi, Supervisor Control Plane VMs y Avi Controller. Se debe relevar en la auditoría As-Is y confirmar en Fase 2.2.',
    vlanId: '',
    subnetCidr: '',
    gateway: '',
    usableIpRange: '',
    dnsServers: '',
    notes: 'Pendiente de relevamiento y asignación por parte del cliente (Fase 2.2).',
    isRoutable: true
  },
  {
    id: 'net_vip',
    networkType: 'frontend_vip',
    name: 'Red Frontend / VIPs (Ingress)',
    description: 'Rango de IPs enrutable para la publicación de Kube-API, balanceadores L4/L7 y servicios de Kubernetes.',
    vlanId: '',
    subnetCidr: '',
    gateway: '',
    usableIpRange: '',
    dnsServers: '',
    notes: 'Pendiente de definición según arquitectura aprobada (NSX o Avi) en Fase 2.2.',
    isRoutable: true
  },
  {
    id: 'net_workload',
    networkType: 'workload',
    name: 'Red Workload (Egress / Nodos K8s)',
    description: 'Subred para interfaces de red de los worker nodes de Tanzu (TKG).',
    vlanId: '',
    subnetCidr: '',
    gateway: '',
    usableIpRange: '',
    dnsServers: '',
    notes: 'Pendiente de relevamiento y asignación por el equipo de networking del cliente.',
    isRoutable: true
  },
  {
    id: 'net_pods',
    networkType: 'pods_internal',
    name: 'Red Interna de Pods (CIDR no enrutable)',
    description: 'Espacio de direcciones virtuales internas para pods (CNI Antrea). No debe solaparse con redes del cliente.',
    vlanId: 'N/A (Virtual CNI)',
    subnetCidr: '',
    gateway: 'Virtual (CNI Antrea)',
    usableIpRange: '',
    notes: 'Pendiente de confirmación con el cliente en Fase 2.2 (Sugerido estándar: 10.244.0.0/16 si no colisiona con la red corporativa).',
    isRoutable: false
  },
  {
    id: 'net_services',
    networkType: 'services_internal',
    name: 'Red Interna de Services (ClusterIPs)',
    description: 'Espacio de direcciones virtuales para servicios internos ClusterIP.',
    vlanId: 'N/A (Virtual CNI)',
    subnetCidr: '',
    gateway: 'Virtual (kube-proxy / CNI)',
    usableIpRange: '',
    notes: 'Pendiente de confirmación con el cliente en Fase 2.2 (Sugerido estándar: 10.96.0.0/12 si no colisiona).',
    isRoutable: false
  }
];

export const initialProjectState: ProjectState = {
  clientName: '',
  clusterName: '',
  hostsCount: 3,
  storagePlatform: 'HPE SimpliVity 380 Gen10 (Pendiente de Validación en Fase 1.2)',
  networkArchitecture: 'undetermined',
  architectureConfidence: 0,
  discoveredInfrastructure: {},
  phases: initialPhases,
  networkMatrix: initialNetworkMatrix,
  auditLogs: [
    {
      id: 'log_01',
      timestamp: new Date().toISOString(),
      type: 'plan_adapted',
      message: 'Plan de proyecto inicializado sin datos por defecto. Toda la infraestructura se determinará a partir de las etapas de validación técnica.',
      author: 'Sistema Tanzu Tracker'
    }
  ]
};
