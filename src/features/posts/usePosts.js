import { useQuery } from '@tanstack/react-query'
import { getPosts } from './api'

// Same 2-line shape as the useAsync version — but now the result is cached,
// deduped, and shared across every component that asks for ['posts'].
export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: getPosts })
}
