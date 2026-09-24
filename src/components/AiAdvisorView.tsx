import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Server, 
  HelpCircle, 
  Terminal, 
  ShieldCheck, 
  RefreshCw,
  Key,
  AlertCircle
} from 'lucide-react';
import { ArchitectureChoice } from '../types';
import { 
  fetchWithByok, 
  hasStoredApiKey, 
  triggerOpenByokModal 
} from '../services/aiClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiAdvisorViewProps {
  networkArchitecture: ArchitectureChoice;
  completedTasksCount: number;
  totalTasksCount: number;
  onOpenByokModal?: () => void;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  networkArchitecture,
  completedTasksCount,
  totalTasksCount,
  onOpenByokModal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu Asistente y Arquitecto Principal para la implementación de **VMware vSphere with Tanzu sobre HCI HPE SimpliVity** (3 hosts).

Puedo ayudarte con:
1. **Dudas técnicas de ejecución:** Comandos PowerCLI, configuración de NTP, validación de VASA Provider.
2. **Evaluación de la bifurcación de red:** Decisión y diseño entre NSX-T (Opción A) o Avi Load Balancer sobre VDS (Opción B).
3. **Storage Policies (SPBM):** Mapeo de tags de SimpliVity hacia Storage Classes de Kubernetes.
4. **Matriz de IPs y Firewall:** Validación de rangos CIDR y reglas de puertos.

¿En qué paso o decisión del proyecto te gustaría profundizar?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(hasStoredApiKey());

  useEffect(() => {
    const handleKeyChange = () => setHasApiKey(hasStoredApiKey());
    window.addEventListener('gemini_api_key_updated', handleKeyChange);
    return () => window.removeEventListener('gemini_api_key_updated', handleKeyChange);
  }, []);

  const suggestedQuestions = [
    '¿Cómo configuro la Storage Policy SPBM con Tags para datastores SimpliVity?',
    '¿Qué pasos debo seguir para desplegar Avi Controller sobre VDS (Opción B)?',
    '¿Por qué el wizard de Tanzu requiere obligatoriamente DRS en Fully Automated?',
    '¿Cómo sincronizar la Content Library con las OVAs TKr sin salida a internet?',
    'Validar si el rango 10.244.0.0/16 de Pods puede generar colisión de enrutamiento.'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    // Interceptor check before initiating
    if (!hasStoredApiKey()) {
      if (onOpenByokModal) {
        onOpenByokModal();
      } else {
        triggerOpenByokModal({
          errorMessage: 'Por favor ingresa tu API Key de Google Gemini para chatear con el Asistente IA.',
        });
      }
      return;
    }

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const data = await fetchWithByok<{ reply: string }>('/api/advisor-chat', {
        message: query,
        projectContext: {
          networkArchitecture,
          completedTasksCount,
          totalTasksCount,
          platform: 'HPE SimpliVity 380 Gen10 (3 nodes)',
          lastDecision: networkArchitecture === 'avi_vds' 
            ? 'Opción B (Avi LB sobre VDS) seleccionada'
            : networkArchitecture === 'nsx'
            ? 'Opción A (NSX-T Nativo) seleccionada'
            : 'Arquitectura de red en etapa de descubrimiento'
        }
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'No se recibió respuesta del modelo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Advisor chat error:', error);
      let contentText = 'Hubo un error al procesar tu consulta con Google Gemini. Por favor verifica tu conexión y tu API Key.';
      if (error?.message === 'API_KEY_REQUIRED') {
        contentText = '⚠️ Se requiere tu Gemini API Key para utilizar el Asistente IA. Se ha desplegado la ventana para configurarla.';
      } else if (error?.message === 'INVALID_API_KEY') {
        contentText = '⚠️ La Gemini API Key configurada no es válida o ha expirado. Se ha desplegado la ventana para actualizarla.';
      }

      const errorMsg: Message = {
        role: 'assistant',
        content: contentText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Asistente Arquitecto IA de Tanzu & SimpliVity
            </h2>
            <p className="text-xs text-slate-400">
              Consultor técnico en tiempo real para la resolución de dudas, diseño y troubleshooting
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {hasApiKey ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Gemini 3.8 Flash (BYOK Activo)
            </span>
          ) : (
            <button
              onClick={() => (onOpenByokModal ? onOpenByokModal() : triggerOpenByokModal())}
              className="text-xs px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-semibold hover:bg-cyan-900 transition flex items-center gap-1.5"
            >
              <Key className="w-3 h-3" />
              Activar IA (Configurar Key)
            </button>
          )}
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 block px-1">
          Preguntas Rápidas Frecuentes de la Implementación:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs text-left bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[10px] font-semibold opacity-75">
                  {msg.role === 'user' ? 'Tú' : 'Arquitecto Tanzu'}
                </span>
                <span className="text-[10px] opacity-60 font-mono">
                  {msg.timestamp}
                </span>
              </div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 rounded-tl-none flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>El Arquitecto IA está analizando la infraestructura y redactando la respuesta...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={hasApiKey ? "Escribe tu consulta sobre Tanzu, SimpliVity o NSX/Avi..." : "Activa tu Gemini API Key para consultar al Asistente..."}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl flex items-center space-x-2 text-xs sm:text-sm font-semibold transition shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </div>
    </div>
  );
};
