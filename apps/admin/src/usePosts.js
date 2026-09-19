import { useEffect, useState } from 'react'
import { fetchPosts } from './data'

// Hand-rolled, not React Query — Devlog needed a real cache (topic 03) with
// multiple screens reading the same data; Admin is one screen, one query.
// A second app doesn't have to repeat every architectural decision the
// first one made, only the ones that fit its own problem.
export function usePosts() {
  const [state, setState] = useState({ status: 'pending', data: undefined, error: undefined })

  useEffect(() => {
    let alive = true
    fetchPosts().then(
      (data) => alive && setState({ status: 'success', data, error: undefined }),
      (error) => alive && setState({ status: 'error', data: undefined, error }),
    )
    return () => { alive = false }
  }, [])

  return state
}
