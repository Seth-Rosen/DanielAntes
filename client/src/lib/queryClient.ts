import { QueryClient } from "@tanstack/react-query";

// Simple query client for static data
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // No default queryFn needed - we'll use storage directly
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Keep apiRequest for future GitHub API integration
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
  });

  if (!res.ok) {
    const text = await res.text() || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}