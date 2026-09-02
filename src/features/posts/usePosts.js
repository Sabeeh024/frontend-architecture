import { useAsync } from '../../shared/lib/useAsync'
import { getPosts } from './api'

// Thin domain wrapper over the headless useAsync.
// Returns { status: 'pending'|'success'|'error', data, error, reload }.
export function usePosts() {
  return useAsync(() => getPosts(), [])
}
