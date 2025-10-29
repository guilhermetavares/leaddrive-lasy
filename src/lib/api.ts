import { useRouter } from 'next/navigation';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export const apiCall = async (url: string, options: ApiOptions = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Verificar se o retorno é 401 (não autorizado)
  if (response.status === 401) {
    // Remover token inválido
    localStorage.removeItem('accessToken');
    // Redirecionar para login
    window.location.href = '/login';
    throw new Error('Sessão expirada. Redirecionando para login...');
  }

  return response;
};

// Hook personalizado para usar em componentes React
export const useApiCall = () => {
  const router = useRouter();

  const makeApiCall = async (url: string, options: ApiOptions = {}) => {
    const token = localStorage.getItem('accessToken');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Verificar se o retorno é 401 (não autorizado)
    if (response.status === 401) {
      // Remover token inválido
      localStorage.removeItem('accessToken');
      // Redirecionar para login usando router do Next.js
      router.push('/login');
      throw new Error('Sessão expirada. Redirecionando para login...');
    }

    return response;
  };

  return { makeApiCall };
};