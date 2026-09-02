import { useComments, CommentList } from '../../entities/comment'
import { CommentForm } from '../../features/add-comment'
import { Spinner } from '../../shared/ui/Spinner'

// Widget: a self-contained block that stitches an entity (read) and a
// feature (write) together. Pages drop it in by name.
export function CommentsSection({ postId }) {
  const { comments, loading, refetch } = useComments(postId)
  return (
    <section className="comments">
      <h2>Comments</h2>
      {loading ? <Spinner label="Loading comments…" /> : <CommentList comments={comments} />}
      <CommentForm postId={postId} onSuccess={refetch} />
    </section>
  )
}
