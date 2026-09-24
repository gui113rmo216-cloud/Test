/**
 * Client-side AI Service for Google Gemini (BYOK - Bring Your Own Key)
 * Manages the user's Gemini API key stored in localStorage (key: 'gemini_api_key')
 * and intercepts missing/invalid keys.
 */

export const BYOK_STORAGE_KEY = 'gemini_api_key';

export interface ByokModalTriggerPayload {
  errorMessage?: string;
}

type ByokModalListener = (payload?: ByokModalTriggerPayload) => void;
const modalListeners = new Set<ByokModalListener>();

export function registerByokModalListener(listener: ByokModalListener): () => void {
  modalListeners.add(listener);
  return () => {
    modalListeners.delete(listener);
  };
}

export function triggerOpenByokModal(payload?: ByokModalTriggerPayload): void {
  modalListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (err) {
      console.error('Error invoking ByokModal listener:', err);
    }
  });
}

export function getStoredApiKey(): string | null {
  try {
    const key = localStorage.getItem(BYOK_STORAGE_KEY);
    if (!key || !key.trim()) return null;
    return key.trim();
  } catch (e) {
    console.warn('Unable to access localStorage for Gemini API Key:', e);
    return null;
  }
}

export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(BYOK_STORAGE_KEY, key.trim());
    window.dispatchEvent(new Event('gemini_api_key_updated'));
  } catch (e) {
    console.warn('Unable to set Gemini API Key in localStorage:', e);
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(BYOK_STORAGE_KEY);
    window.dispatchEvent(new Event('gemini_api_key_updated'));
  } catch (e) {
    console.warn('Unable to clear Gemini API Key in localStorage:', e);
  }
}

export function hasStoredApiKey(): boolean {
  const key = getStoredApiKey();
  return !!key && key.length > 5;
}

/**
 * Universal fetch wrapper for AI endpoints with BYOK interceptor
 */
export async function fetchWithByok<T>(
  endpoint: string,
  body: Record<string, any>,
  options: { customErrorMessage?: string } = {}
): Promise<T> {
  const apiKey = getStoredApiKey();

  // Interceptor: If no key, halt immediately and trigger the BYOK modal
  if (!apiKey) {
    triggerOpenByokModal({
      errorMessage: 'Esta función requiere activar la IA con tu Google Gemini API Key.',
    });
    throw new Error('API_KEY_REQUIRED');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    // 401 Unauthorized: Key was missing or empty
    triggerOpenByokModal({
      errorMessage: 'Se requiere una API Key de Gemini para utilizar las funciones de IA.',
    });
    throw new Error('API_KEY_REQUIRED');
  }

  if (response.status === 403) {
    // 403 Forbidden: Key is invalid or expired
    clearStoredApiKey();
    triggerOpenByokModal({
      errorMessage: 'La API Key de Gemini ingresada es inválida o ha expirado. Por favor ingresa una clave válida.',
    });
    throw new Error('INVALID_API_KEY');
  }

  if (!response.ok) {
    let errorText = `Error en el servidor (${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.error) errorText = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }

  return response.json();
}
