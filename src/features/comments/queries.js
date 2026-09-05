import { getComments } from './api'

export const commentsQuery = (postId) => ({
  queryKey: ['comments', postId],
  queryFn: () => getComments(postId),
})
