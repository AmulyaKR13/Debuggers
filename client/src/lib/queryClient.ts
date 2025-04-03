import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = Response>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
      ...options,
    });

    // Handle different response types
    if (res.status === 204) {
      // No content response
      return {} as T;
    }
    
    // For Response type, just return the response
    if (Object.getPrototypeOf(Response.prototype).isPrototypeOf(Response.prototype)) {
      return res as unknown as T;
    }

    // Try to parse the response as JSON
    try {
      const data = await res.json();
      
      // If the response is not OK, throw an error with the error details
      if (!res.ok) {
        const errorMessage = data.message || res.statusText;
        const error = new Error(errorMessage);
        (error as any).status = res.status;
        (error as any).data = data;
        throw error;
      }
      
      return data as T;
    } catch (parseError) {
      // If JSON parsing fails and response is not OK, throw a generic error
      if (!res.ok) {
        const error = new Error(res.statusText || "Request failed");
        (error as any).status = res.status;
        throw error;
      }
      
      // If we can't parse JSON but the response is OK, return empty object
      return {} as T;
    }
  } catch (error) {
    console.error(`API request failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
