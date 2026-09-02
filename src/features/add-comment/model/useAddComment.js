import { useState } from 'react'
import { addComment } from '../api/addCommentApi'

export function useAddComment(postId) {
  const [pending, setPending] = useState(false)

  async function submit({ body, authorId }) {
    setPending(true)
    try {
      await addComment(postId, { body, authorId })
    } finally {
      setPending(false)
    }
  }

  return { submit, pending }
}
