import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addComment } from './api'
import { commentsQuery } from './queries'

// Read + write for one post's comments.
export function useComments(postId) {
  const qc = useQueryClient()
  const key = commentsQuery(postId).queryKey

  const query = useQuery(commentsQuery(postId))

  const mutation = useMutation({
    mutationFn: ({ body, author }) => addComment(postId, { body, authorId: author.id }),

    // Optimistic update: show the comment before the server confirms.
    onMutate: async ({ body, author }) => {
      await qc.cancelQueries({ queryKey: key }) // stop in-flight refetches clobbering us
      const previous = qc.getQueryData(key) // snapshot for rollback
      const optimistic = {
        id: `temp-${Date.now()}`,
        postId,
        body,
        author,
        createdAt: new Date().toISOString(),
        pending: true,
      }
      qc.setQueryData(key, (list = []) => [...list, optimistic])
      return { previous } // -> ctx in onError / onSettled
    },

    onError: (_err, _vars, ctx) => {
      qc.setQueryData(key, ctx.previous) // roll back to the snapshot
    },

    // Success or failure, reconcile with the server's truth.
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  return {
    comments: query.data ?? [],
    loading: query.isPending,
    add: mutation.mutateAsync,
  }
}
