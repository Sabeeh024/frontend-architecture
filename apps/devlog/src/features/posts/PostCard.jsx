import { Link } from 'react-router-dom'
import { Avatar } from '@repo/ui'
import { formatDate } from '../../shared/lib/formatDate'
import { useLocalizedPath } from '../../shared/i18n/useLocalizedPath'

export function PostCard({ post }) {
  const to = useLocalizedPath()
  return (
    <article className="post-card">
      <h2><Link to={to(`/posts/${post.id}`)}>{post.title}</Link></h2>
      <p className="meta">
        <Avatar name={post.author.name} /> {post.author.name} · {formatDate(post.createdAt)}
      </p>
      <p>{post.body}</p>
    </article>
  )
}
