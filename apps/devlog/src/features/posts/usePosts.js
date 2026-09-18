import { useQuery } from '@tanstack/react-query'
import { postsQuery } from './queries'

export function usePosts() {
  return useQuery(postsQuery())
}
