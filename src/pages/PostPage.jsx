import { useParams, Link } from 'react-router-dom'
import { usePost } from '../hooks/usePost'
import { useComments } from '../hooks/useComments'
import { Spinner } from '../components/Spinner'
import { Avatar } from '../components/Avatar'
import { CommentList } from '../components/CommentList'
import { CommentForm } from '../components/CommentForm'
import { formatDate } from '../utils/formatDate'

export function PostPage() {
  const { id } = useParams()
  const { post, loading } = usePost(id)
  const { comments, loading: commentsLoading, post: addComment } = useComments(id)

  if (loading) return <Spinner label="Loading post…" />
  if (!post) return <p>Post not found. <Link to="/">Back to feed</Link></p>

  return (
    <article className="post">
      <Link to="/" className="back">← Feed</Link>
      <h1>{post.title}</h1>
      <p className="meta"><Avatar name={post.author.name} /> {post.author.name} · {formatDate(post.createdAt)}</p>
      <p>{post.body}</p>

      <section className="comments">
        <h2>Comments</h2>
        {commentsLoading ? <Spinner label="Loading comments…" /> : <CommentList comments={comments} />}
        <CommentForm onSubmit={addComment} />
      </section>
    </article>
  )
}
