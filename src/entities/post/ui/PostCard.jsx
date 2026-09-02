import { Link } from 'react-router-dom'
import { Avatar } from '../../../shared/ui/Avatar'
import { formatDate } from '../../../shared/lib/formatDate'

// Entity UI: how a Post renders. No page/route knowledge.
export function PostCard({ post }) {
  return (
    <article className="post-card">
      <h2><Link to={`/posts/${post.id}`}>{post.title}</Link></h2>
      <p className="meta">
        <Avatar name={post.author.name} /> {post.author.name} · {formatDate(post.createdAt)}
      </p>
      <p>{post.body}</p>
    </article>
  )
}
