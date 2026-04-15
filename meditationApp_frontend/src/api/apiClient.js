import { API_BASE_URL } from './config';

/**
 * Cliente HTTP centralizado para todas las peticiones al backend.
 * Adjunta el token JWT automáticamente si se proporciona.
 * Lanza un error con `error.status` para que los componentes puedan
 * detectar 401 y forzar logout sin duplicar lógica.
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const err = new Error(body.message || 'Error en la petición');
    err.status = response.status;
    throw err;
  }

  return response.json();
}
