interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

interface LoginResponse {
  AccessToken: string;
  user?: any;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
}

const API_BASE = 'https://y3c7214nh2.execute-api.us-east-1.amazonaws.com';

export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer login');
  }

  return response.json();
}

export async function register(data: RegisterData): Promise<any> {
  const response = await fetch(`${API_BASE}/opt-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar conta');
  }

  return response.json();
}

// Função para buscar dados do usuário logado
export async function getMe(accessToken: string): Promise<UserData> {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      // Adiciona configurações para evitar problemas de CORS e timeout
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API /me:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText || 'Erro ao buscar dados do usuário'}`);
    }

    const data = await response.json();
    console.log('Dados recebidos da API /me:', data);
    return data;
  } catch (error) {
    console.error('Erro detalhado na chamada /me:', error);
    
    // Se for erro de rede, tenta novamente após um delay
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.log('Tentando novamente após erro de rede...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const retryResponse = await fetch(`${API_BASE}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        });

        if (!retryResponse.ok) {
          throw new Error(`Erro ${retryResponse.status} na segunda tentativa`);
        }

        return retryResponse.json();
      } catch (retryError) {
        console.error('Erro na segunda tentativa:', retryError);
        throw new Error('Erro de conexão com a API. Verifique sua internet e tente novamente.');
      }
    }
    
    throw error;
  }
}

// Função genérica para fazer chamadas autenticadas para qualquer endpoint
export async function authenticatedRequest(
  endpoint: string, 
  accessToken: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  try {
    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log(`Fazendo chamada para: ${API_BASE}${endpoint}`);
    console.log('Headers:', config.headers);

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API ${endpoint}:`, response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText || `Erro na requisição para ${endpoint}`}`);
    }

    const data = await response.json();
    console.log(`Resposta de ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`Erro detalhado em ${endpoint}:`, error);
    
    // Se for erro de rede, informa de forma mais clara
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Erro de conexão ao acessar ${endpoint}. Verifique sua internet.`);
    }
    
    throw error;
  }
}

// Funções específicas para endpoints do dashboard (exemplos)
export async function getLeads(accessToken: string): Promise<any> {
  return authenticatedRequest('/leads', accessToken);
}

export async function getStats(accessToken: string): Promise<any> {
  return authenticatedRequest('/stats', accessToken);
}

export async function getCampaigns(accessToken: string): Promise<any> {
  return authenticatedRequest('/campaigns', accessToken);
}

export async function getReports(accessToken: string): Promise<any> {
  return authenticatedRequest('/reports', accessToken);
}

// Funções para gerenciar o token no localStorage
export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
}

// Função para verificar se o token é válido
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Verifica se o token tem o formato JWT básico
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decodifica o payload para verificar expiração (se existir)
    const payload = JSON.parse(atob(parts[1]));
    
    // Se tem campo de expiração, verifica
    if (payload.exp) {
      const now = Date.now() / 1000;
      return payload.exp > now;
    }
    
    // Se não tem expiração, considera válido
    return true;
  } catch {
    // Se não conseguir decodificar, ainda considera válido (pode não ser JWT)
    return true;
  }
}