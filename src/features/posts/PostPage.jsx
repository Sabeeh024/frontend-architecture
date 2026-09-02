import { useParams, Link } from 'react-router-dom'
import { usePost } from './usePost'
import { CommentsSection } from '../comments'
import { Spinner } from '../../shared/ui/Spinner'
import { Avatar } from '../../shared/ui/Avatar'
import { formatDate } from '../../shared/lib/formatDate'

// Contrast with FeedPage: here we consume the headless hook directly and
// branch by hand. More code, but full control — sometimes that's what you want.
export function PostPage() {
  const { id } = useParams()
  const { status, data: post } = usePost(id)

  if (status === 'pending') return <Spinner label="Loading post…" />
  if (status === 'error') return <p className="muted">Could not load this post.</p>
  if (!post) return <p>Post not found. <Link to="/">Back to feed</Link></p>

  return (
    <article className="post">
      <Link to="/" className="back">← Feed</Link>
      <h1>{post.title}</h1>
      <p className="meta"><Avatar name={post.author.name} /> {post.author.name} · {formatDate(post.createdAt)}</p>
      <p>{post.body}</p>
      <CommentsSection postId={post.id} />
    </article>
  )
}
