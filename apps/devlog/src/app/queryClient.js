import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { track } from '../shared/lib/analytics'

// Cross-cutting concern #1: observability via a *decorator on the queryClient*.
// One global place every failed query/mutation passes through — logging only.
// User-facing error UI stays at the call site (component branch / toast).
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) =>
      track('query_error', { key: query.queryKey, message: error.message }),
  }),
  mutationCache: new MutationCache({
    onError: (error) => track('mutation_error', { message: error.message }),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data is "fresh" for 30s -> no refetch on remount/navigation
      retry: 1,
    },
  },
})

// Loader helpers built on v5's unified imperative method `queryClient.query()`
// (ensureQueryData / fetchQuery / prefetchQuery are all deprecated in v5).
// The prefetching guide splits two intents:
const noop = () => {}

// CRITICAL data — await it, block the navigation until it's ready.
// `staleTime: 'static'` = serve from cache on a hit, fetch only on a miss
// (the old ensureQueryData behaviour). A rejection here hits the errorElement.
export const loadQuery = (options) =>
  queryClient.query({ ...options, staleTime: 'static' })

// SECONDARY data — kick the fetch off now (in parallel with the route's code
// chunk and its critical data) but DON'T await it and DON'T let a failure
// abort the route. The component renders, shows its own loading state, and
// its useQuery dedupes onto this in-flight request.
export const prefetchQuery = (options) => {
  void queryClient.query(options).catch(noop)
}
