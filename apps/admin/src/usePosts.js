import { useEffect, useState } from 'react'
import { getPosts } from '@repo/api-client'

// Hand-rolled, not React Query — Devlog needed a real cache (topic 03) with
// multiple screens reading the same data; Admin is one screen, one query.
// A second app doesn't have to repeat every architectural decision the
// first one made, only the ones that fit its own problem. What it DOES now
// share is the data itself (topic 13) — getPosts() is the same function
// apps/devlog calls, just without React Query wrapped around it here.
export function usePosts() {
  const [state, setState] = useState({ status: 'pending', data: undefined, error: undefined })

  useEffect(() => {
    let alive = true
    getPosts().then(
      (data) => alive && setState({ status: 'success', data, error: undefined }),
      (error) => alive && setState({ status: 'error', data: undefined, error }),
    )
    return () => { alive = false }
  }, [])

  return state
}
