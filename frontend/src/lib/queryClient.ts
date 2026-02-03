import { QueryClient } from "@tanstack/react-query";

/**
 * React Query configuration for optimal performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache queries for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 1 time
      retry: 1,
      // Refetch on window focus in production only
      refetchOnWindowFocus: import.meta.env.PROD,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  staff: {
    all: ["staff"] as const,
    lists: () => [...queryKeys.staff.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.staff.lists(), filters] as const,
    details: () => [...queryKeys.staff.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.staff.details(), id] as const,
  },
  optimize: {
    all: ["optimize"] as const,
  },
};
