import { useState } from 'react'
import { Button } from '../../shared/ui/Button'

// Gated by the `reactions` flag in PostPage. Trivial on purpose — the point is
// the flag boundary, not the feature.
export function Reactions() {
  const [n, setN] = useState(3)
  return (
    <p>
      <Button variant="ghost" onClick={() => setN((x) => x + 1)}>👍 {n}</Button>
    </p>
  )
}
