// Nota técnica - Perfumería Fabio:
// Conexión dinámica con soporte para Red Local (LAN) y peticiones administrativas seguras.

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_URL: string = import.meta.env.VITE_API_URL || `http://${defaultHost}:5001/api`;

// URL base para archivos estáticos (imágenes subidas)
export const UPLOADS_BASE_URL: string = API_URL.replace(/\/api$/, '');

export const formatBs = (amount: number | undefined | null): string => {
  const num = Number(amount || 0);
  return `Bs ${num.toFixed(2).replace('.', ',')}`;
};

const getHeaders = (isFormData = false): HeadersInit => {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('fabio_auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const httpClient = {
  async get<T>(endpoint: string): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status} en GET ${endpoint}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status} en POST ${endpoint}`);
    }

    return response.json();
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status} en PUT ${endpoint}`);
    }

    return response.json();
  },

  async patch<T>(endpoint: string, body: any): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status} en PATCH ${endpoint}`);
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status} en DELETE ${endpoint}`);
    }

    return response.json();
  },

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP ${response.status} al subir archivo`);
    }

    return response.json();
  },
};
