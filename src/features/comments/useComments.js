import { useAsync } from '../../shared/lib/useAsync'
import { getComments, addComment } from './api'

export function useComments(postId) {
  const query = useAsync(() => getComments(postId), [postId])

  async function add({ body, authorId }) {
    await addComment(postId, { body, authorId })
    query.reload()
  }

  return {
    comments: query.data ?? [],
    loading: query.status === 'pending',
    add,
  }
}
