import { useQuery } from '@tanstack/react-query'
import { getPost } from './api'

export function usePost(id) {
  return useQuery({ queryKey: ['posts', id], queryFn: () => getPost(id) })
}
