import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import { formatDate } from '../utils/formatDate'

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
