import { Avatar } from './Avatar'
import { formatDate } from '../utils/formatDate'

export function CommentList({ comments }) {
  if (comments.length === 0) return <p className="muted">No comments yet.</p>
  return (
    <ul className="comment-list">
      {comments.map((c) => (
        <li key={c.id}>
          <p className="meta"><Avatar name={c.author.name} /> {c.author.name} · {formatDate(c.createdAt)}</p>
          <p>{c.body}</p>
        </li>
      ))}
    </ul>
  )
}
