import { useComments } from './useComments'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { Spinner } from '../../shared/ui/Spinner'

// Composite the posts feature drops in without knowing how comments work.
export function CommentsSection({ postId }) {
  const { comments, loading, add } = useComments(postId)
  return (
    <section className="comments">
      <h2>Comments</h2>
      {loading ? <Spinner label="Loading comments…" /> : <CommentList comments={comments} />}
      <CommentForm onSubmit={add} />
    </section>
  )
}
