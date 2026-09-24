import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  getStoredApiKey, 
  setStoredApiKey, 
  clearStoredApiKey 
} from '../services/aiClient';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: string | null;
  onKeySaved?: () => void;
}

export const ByokModal: React.FC<ByokModalProps> = ({
  isOpen,
  onClose,
  initialError,
  onKeySaved,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [hasExistingKey, setHasExistingKey] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getStoredApiKey();
      setHasExistingKey(!!existing);
      setApiKeyInput(existing || '');
      setErrorMessage(initialError || null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialError]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setErrorMessage('Por favor introduce una API Key válida de Google Gemini.');
      return;
    }

    if (trimmed.length < 15) {
      setErrorMessage('La API Key parece demasiado corta. Las claves de Google AI Studio suelen iniciar con "AIzaSy...".');
      return;
    }

    setStoredApiKey(trimmed);
    setHasExistingKey(true);
    setErrorMessage(null);
    setSuccessMessage('¡API Key guardada exitosamente en tu navegador!');
    
    if (onKeySaved) {
      onKeySaved();
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemoveKey = () => {
    clearStoredApiKey();
    setApiKeyInput('');
    setHasExistingKey(false);
    setSuccessMessage('Clave eliminada del almacenamiento local.');
    setErrorMessage(null);
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setErrorMessage('Ingresa una clave para probar la conexión.');
      return;
    }

    setIsTesting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({
          message: 'Ping de prueba de conexión BYOK.',
          projectContext: {
            networkArchitecture: 'undetermined',
            completedTasksCount: 0,
            totalTasksCount: 1,
            lastDecision: 'Test',
          },
        }),
      });

      if (response.status === 401) {
        setErrorMessage('La petición no incluyó la API Key requerida.');
        return;
      }

      if (response.status === 403) {
        setErrorMessage('La API Key es inválida o ha expirado en Google AI Studio.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      setStoredApiKey(keyToTest);
      setHasExistingKey(true);
      setSuccessMessage('¡Conexión validada con Google Gemini exitosamente!');
      if (onKeySaved) {
        onKeySaved();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al conectar con la API de Google Gemini.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Activar IA (Bring Your Own Key)
              </h3>
              <p className="text-xs text-slate-400">
                Conexión segura multi-tenant con Google Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Description mandated by specification */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Esta aplicación utiliza <strong className="text-cyan-400">Google Gemini</strong>. Para mantener el servicio gratuito, se conecta usando tu propia cuota. Ve a{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline inline-flex items-center gap-1"
              >
                https://aistudio.google.com/app/apikey
                <ExternalLink className="w-3 h-3" />
              </a>
              , crea una API Key y pégala aquí. Se guardará localmente en tu navegador.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                placeholder="Pega aquí tu clave (AIzaSy...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-20 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition rounded"
                  title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              La clave nunca se almacena en el servidor. Permanece exclusivamente en el <code className="text-slate-400">localStorage</code> de tu navegador.
            </p>
          </div>

          {/* Security & Multi-tenant note */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Arquitectura Stateless: Cada petición transmite la clave en memoria vía cabecera segura <code className="text-cyan-300 font-mono text-[10px]">x-gemini-api-key</code>.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
            {hasExistingKey ? (
              <button
                type="button"
                onClick={handleRemoveKey}
                className="w-full sm:w-auto text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-3 py-2 rounded-xl transition flex items-center justify-center space-x-1 border border-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Clave</span>
              </button>
            ) : (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-xs text-slate-400 hover:text-cyan-400 px-3 py-2 rounded-xl transition flex items-center justify-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Obtener Clave Gratuita</span>
              </a>
            )}

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting || !apiKeyInput.trim()}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isTesting ? 'Probando...' : 'Probar Conexión'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                Guardar API Key
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
