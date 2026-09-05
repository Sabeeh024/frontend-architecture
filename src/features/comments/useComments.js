import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addComment } from './api'
import { commentsQuery } from './queries'

// Read + write for one post's comments.
// The write no longer needs a manual reload() wired through props: it just
// invalidates the ['comments', postId] key and every consumer refetches.
export function useComments(postId) {
  const qc = useQueryClient()

  const query = useQuery(commentsQuery(postId))

  const mutation = useMutation({
    mutationFn: (input) => addComment(postId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  })

  return {
    comments: query.data ?? [],
    loading: query.isPending,
    add: mutation.mutateAsync,
  }
}
