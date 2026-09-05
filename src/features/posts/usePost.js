import { useQuery } from '@tanstack/react-query'
import { postQuery } from './queries'

export function usePost(id) {
  return useQuery(postQuery(id))
}
