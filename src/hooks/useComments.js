import { useCallback, useEffect, useState } from 'react'
import { getComments, addComment } from '../api/comments'

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getComments(postId).then((data) => {
      if (alive) {
        setComments(data)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [postId])

  const post = useCallback(
    async ({ body, authorId }) => {
      const created = await addComment(postId, { body, authorId })
      setComments((cs) => [...cs, created])
    },
    [postId],
  )

  return { comments, loading, post }
}
