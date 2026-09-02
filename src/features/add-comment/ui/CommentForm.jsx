import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../../entities/session'
import { useAddComment } from '../model/useAddComment'
import { Button } from '../../../shared/ui/Button'

export function CommentForm({ postId, onSuccess }) {
  const { user } = useSession()
  const { submit, pending } = useAddComment(postId)
  const [body, setBody] = useState('')

  if (!user) return <p className="muted"><Link to="/login">Log in</Link> to comment.</p>

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    await submit({ body: body.trim(), authorId: user.id })
    setBody('')
    onSuccess?.()
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment…" rows={3} />
      <Button type="submit" disabled={pending}>{pending ? 'Posting…' : 'Post comment'}</Button>
    </form>
  )
}
