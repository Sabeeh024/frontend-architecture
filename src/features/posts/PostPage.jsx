import { useParams, Link } from 'react-router-dom'
import { usePost } from './usePost'
import { Reactions } from './Reactions'
import { CommentsSection } from '../comments'
import { Spinner } from '../../shared/ui/Spinner'
import { Avatar } from '../../shared/ui/Avatar'
import { ErrorBoundary } from '../../shared/ui/ErrorBoundary'
import { formatDate } from '../../shared/lib/formatDate'
import { useFlag } from '../../shared/config/flags'

// Contrast with FeedPage: here we consume the headless hook directly and
// branch by hand. More code, but full control — sometimes that's what you want.
export function PostPage() {
  const { id } = useParams()
  const { status, data: post } = usePost(id)
  const showReactions = useFlag('reactions')

  if (status === 'pending') return <Spinner label="Loading post…" />
  if (status === 'error') return <p className="muted">Could not load this post.</p>
  if (!post) return <p>Post not found. <Link to="/">Back to feed</Link></p>

  return (
    <article className="post">
      <Link to="/" className="back">← Feed</Link>
      <h1>{post.title}</h1>
      <p className="meta"><Avatar name={post.author.name} /> {post.author.name} · {formatDate(post.createdAt)}</p>
      <p>{post.body}</p>

      {showReactions && <Reactions />}

      {/* Blast radius = the comments block only. If it throws, the article stays. */}
      <ErrorBoundary fallback={(err, reset) => (
        <section className="comments">
          <h2>Comments</h2>
          <p className="muted">Couldn’t load comments. <button className="btn btn--ghost" onClick={reset}>Retry</button></p>
        </section>
      )}>
        <CommentsSection postId={post.id} />
      </ErrorBoundary>
    </article>
  )
}
