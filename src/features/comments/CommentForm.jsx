import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth' // cross-feature dependency, via auth's public API
import { Button } from '../../shared/ui/Button'

export function CommentForm({ onSubmit }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  if (!user) return <p className="muted"><Link to="/login">Log in</Link> to comment.</p>

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      await onSubmit({ body: body.trim(), authorId: user.id })
      setBody('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment…" rows={3} />
      <Button type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post comment'}</Button>
    </form>
  )
}
