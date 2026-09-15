import { useParams, Link } from 'react-router-dom'
import { usePost } from './usePost'
import { Reactions } from './Reactions'
import { CommentsSection } from '../comments'
import { Spinner } from '../../shared/ui/Spinner'
import { Avatar } from '../../shared/ui/Avatar'
import { ErrorBoundary } from '../../shared/ui/ErrorBoundary'
import { formatDate } from '../../shared/lib/formatDate'
import { useFlag } from '../../shared/config/flags'
import { useT } from '../../shared/i18n/t'

// Contrast with FeedPage: here we consume the headless hook directly and
// branch by hand. More code, but full control — sometimes that's what you want.
export function PostPage() {
  const { id } = useParams()
  const { status, data: post } = usePost(id)
  const showReactions = useFlag('reactions')
  const t = useT()

  if (status === 'pending') return <Spinner label={t('post.loading')} />
  if (status === 'error') return <p className="muted">{t('post.loadError')}</p>
  if (!post) return <p>{t('post.notFound')} <Link to="/">{t('post.backToFeed')}</Link></p>

  return (
    <article className="post">
      <Link to="/" className="back">{t('post.back')}</Link>
      <h1>{post.title}</h1>
      <p className="meta"><Avatar name={post.author.name} /> {post.author.name} · {formatDate(post.createdAt)}</p>
      <p>{post.body}</p>

      {showReactions && <Reactions />}

      {/* Blast radius = the comments block only. If it throws, the article stays. */}
      <ErrorBoundary fallback={(err, reset) => (
        <section className="comments">
          <h2>{t('comments.title')}</h2>
          <p className="muted">{t('comments.loadError')} <button className="btn btn--ghost" onClick={reset}>{t('comments.retry')}</button></p>
        </section>
      )}>
        <CommentsSection postId={post.id} />
      </ErrorBoundary>
    </article>
  )
}
