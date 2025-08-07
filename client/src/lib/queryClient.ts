// lib/queryClient.ts

import { QueryClient, QueryFunction } from "@tanstack/react-query";

// URL base do seu backend NestJS
// IMPORTANTE: Mude para o domínio do seu backend em produção (ex: "https://api.mkcloset.com")
const API_BASE_URL = "http://localhost:3001";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // Tenta parsear JSON de erro do backend se disponível
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || res.statusText);
    } catch {
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

// Função auxiliar para obter o token JWT do localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

// Função para fazer requisições API com autenticação
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Mantenha se o backend usa cookies/sessões, caso contrário pode remover
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
      headers,
      credentials: "include", // Mantenha se o backend usa cookies/sessões, caso contrário pode remover
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache para queries
      retry: (failureCount, error) => {
        // Não tentar novamente em caso de 401 Unauthorized
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3; // Tentar 3 vezes
      },
    },
    mutations: {
      retry: false, // Mutações geralmente não devem ser retentadas automaticamente
    },
  },
});