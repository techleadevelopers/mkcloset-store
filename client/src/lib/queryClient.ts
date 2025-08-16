// lib/queryClient.ts

import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 1. Definição do tipo UnauthorizedBehavior
type UnauthorizedBehavior = "returnNull" | "throw";

// 2. Correção para variáveis de ambiente no Vite
// IMPORTANTE: Use uma variável de ambiente para a URL da API para produção e um fallback para desenvolvimento.
// O backend na Cloud Run (produção) deve ter a variável 'VITE_BACKEND_API_URL' definida (no .env do frontend).
// Para desenvolvimento local, 'http://localhost:3001' é o padrão.
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "https://mkcloset-backend-586033150214.southamerica-east1.run.app/api";

/**
 * Função auxiliar para obter ou gerar um guestId.
 * Movida para cá para ser acessível por apiRequest.
 */
export function getOrCreateGuestId(): string { // CORRIGIDO: Adicionado 'export'
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    // Gerar um UUID v4 simples
    guestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
}

/**
 * Verifica se a resposta da requisição foi bem-sucedida (status 2xx).
 * Se não for, tenta parsear a mensagem de erro do corpo da resposta e lança uma exceção.
 * @param res A resposta da requisição Fetch.
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // CLONAR a resposta para que o corpo possa ser lido aqui sem afetar a resposta original
    // que pode ser lida novamente (ex: res.json()) pelo chamador.
    const errorRes = res.clone();
    const text = (await errorRes.text()) || res.statusText;
    try {
      const errorData = JSON.parse(text);
      // Lança um erro com a mensagem da API ou o statusText
      throw new Error(errorData.message || res.statusText);
    } catch {
      // Se não for JSON, ou se JSON.parse falhar, lança um erro com o status e o texto completo
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

/**
 * Obtém o token de autenticação (JWT) do localStorage.
 * Retorna null se o token não for encontrado ou se estiver em um ambiente sem localStorage.
 * @returns O token de acesso ou null.
 */
function getAuthToken(): string | null {
  // typeof localStorage !== 'undefined' verifica se o localStorage está disponível
  // Isso é importante para SSR (Server-Side Rendering) onde localStorage não existe no servidor.
  return typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
}

/**
 * Realiza uma requisição HTTP genérica para a API.
 * Adiciona o token de autenticação ao cabeçalho 'Authorization' se disponível.
 * Para usuários não autenticados, adiciona o guestId como query parameter para operações de carrinho (GET, PATCH, DELETE).
 * @param method O método HTTP (GET, POST, PUT, DELETE, PATCH).
 * @param url O caminho da URL da API (ex: '/products', '/cart/items').
 * @param data O corpo da requisição para métodos como POST, PUT, PATCH.
 * @returns A resposta da requisição Fetch.
 * @throws Erro se a requisição não for bem-sucedida (status diferente de 2xx).
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken(); // Obtém o token
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Adiciona o token ao cabeçalho Authorization se ele existir
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let finalUrl = `${API_BASE_URL}${url}`;
  // Se não houver token e a URL for de carrinho, adicione guestId como query param
  // Exceção: POST /cart/items já envia guestId no corpo, então não duplique.
  if (!token && url.startsWith('/cart')) {
    // Verifica se é uma operação de adicionar item (POST para /cart/items)
    // e se o guestId já está no corpo (como é feito no use-cart.tsx)
    const isAddItemPost = method === 'POST' && url === '/cart/items' && data && typeof data === 'object' && 'guestId' in data;
    
    if (!isAddItemPost) {
      const currentGuestId = getOrCreateGuestId();
      const urlObj = new URL(finalUrl);
      urlObj.searchParams.set('guestId', currentGuestId);
      finalUrl = urlObj.toString();
    }
  }

  const res = await fetch(finalUrl, { // Use finalUrl
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Inclui cookies (se houver, embora JWT seja preferencial)
  });

  await throwIfResNotOk(res); // Lança erro se a resposta não for ok
  return res;
}

/**
 * Função utilitária para ser usada como `queryFn` no React Query.
 * Permite configurar o comportamento em caso de resposta 401 (Unauthorized).
 * @param options.on401 Define o comportamento para respostas 401: 'returnNull' ou 'throw'.
 * @returns Uma função `QueryFunction` compatível com `@tanstack/react-query`.
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // queryKey[0] deve ser o path da API (ex: '/products/id', '/user/profile')
    // A URL já será construída com guestId se necessário pela apiRequest
    const requestUrl = queryKey[0] as string; // apiRequest já adiciona API_BASE_URL

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Usamos apiRequest para que a lógica de guestId e cloning seja aplicada
    const res = await apiRequest('GET', requestUrl); // apiRequest agora lida com guestId e cloning

    // Lógica para lidar com 401 baseada na configuração
    // Note: throwIfResNotOk já lançaria o erro para 401 se 'throw' for o comportamento.
    // Este bloco é mais relevante se unauthorizedBehavior fosse 'returnNull'.
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Se a resposta for OK, e não retornou null para 401, parseia o JSON
    return await res.json(); // Agora res.json() funcionará porque throwIfResNotOk usou res.clone()
  };

// Configuração do cliente React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por padrão, as queries lançarão um erro em caso de 401
      queryFn: getQueryFn({ on401: "throw" }), 
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Dados "stale" após 5 minutos
      retry: (failureCount, error) => {
        // Não tenta novamente em caso de 401
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        // Tenta novamente até 3 vezes para outros erros
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false, // Mutações não tentam novamente por padrão
    },
  },
});
