import { useCallback, useEffect, useState } from 'react'
import { getComments } from '../api/commentsApi'

// Read model only. Writing a comment is a *feature* (features/add-comment),
// so this hook just exposes refetch() for the writer to call on success.
export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    return getComments(postId).then((data) => {
      setComments(data)
      setLoading(false)
    })
  }, [postId])

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

  return { comments, loading, refetch: load }
}
