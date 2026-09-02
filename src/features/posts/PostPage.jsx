import { useParams, Link } from 'react-router-dom'
import { usePost } from './usePost'
import { CommentsSection } from '../comments' // compose another feature via its public API
import { Spinner } from '../../shared/ui/Spinner'
import { Avatar } from '../../shared/ui/Avatar'
import { formatDate } from '../../shared/lib/formatDate'

export function PostPage() {
  const { id } = useParams()
  const { post, loading } = usePost(id)

  if (loading) return <Spinner label="Loading post…" />
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
