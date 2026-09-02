import { useAsync } from '../../shared/lib/useAsync'
import { getPost } from './api'

export function usePost(id) {
  return useAsync(() => getPost(id), [id])
}
