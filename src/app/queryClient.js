import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data is "fresh" for 30s -> no refetch on remount/navigation
      retry: 1,
    },
  },
})

// Loader helper: v5's unified imperative method (replaces the now-deprecated
// ensureQueryData / fetchQuery / prefetchQuery). `staleTime: 'static'` means
// "return whatever is in cache without refetching; only fetch on a miss" —
// the old ensureQueryData behaviour. The component's useQuery still handles
// background revalidation once mounted.
export const loadQuery = (options) =>
  queryClient.query({ ...options, staleTime: 'static' })
