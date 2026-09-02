import { useCallback, useEffect, useState } from 'react'

// Headless: runs an async function, tracks status. No markup, no opinions.
// `fn` should be stable (wrap in useCallback) or listed via `deps`.
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: 'pending', data: undefined, error: undefined })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  const reload = useCallback(() => {
    let alive = true
    setState((s) => ({ ...s, status: 'pending' }))
    run().then(
      (data) => alive && setState({ status: 'success', data, error: undefined }),
      (error) => alive && setState({ status: 'error', data: undefined, error }),
    )
    return () => {
      alive = false
    }
  }, [run])

  useEffect(reload, [reload])

  return { ...state, reload }
}
