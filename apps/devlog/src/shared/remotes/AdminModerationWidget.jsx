import { useEffect, useRef, useState } from 'react'

// admin's widget is a SEPARATE deployable: built independently
// (`npm run build:widget` in apps/admin) into a single self-mounting ES
// module. Devlog knows nothing about admin's source, dependencies, or React
// version — only this URL and the `mount(container) -> unmount` contract.
const WIDGET_URL = 'http://localhost:4174/widget.js'

export function AdminModerationWidget() {
  const ref = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unmount
    let cancelled = false
    import(/* @vite-ignore */ WIDGET_URL)
      .then((mod) => {
        if (cancelled) return
        unmount = mod.mount(ref.current)
      })
      .catch(setError)
    return () => {
      cancelled = true
      unmount?.()
    }
  }, [])

  if (error) return <p className="muted">Moderation widget unavailable (is apps/admin running?)</p>
  return <div ref={ref} />
}
