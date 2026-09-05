import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
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
