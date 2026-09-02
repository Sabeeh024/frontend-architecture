import { useEffect, useState } from 'react'
import { getPost } from '../api/postsApi'

export function usePost(id) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getPost(id).then((data) => {
      if (alive) {
        setPost(data)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [id])

  return { post, loading }
}
