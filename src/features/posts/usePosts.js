import { useEffect, useState } from 'react'
import { getPosts } from './api'

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getPosts().then((data) => {
      if (alive) {
        setPosts(data)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  return { posts, loading }
}
