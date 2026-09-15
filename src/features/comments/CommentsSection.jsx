import { Comments } from './ui/Comments'
import { useT } from '../../shared/i18n/t'

// Default composition the posts feature drops in. Because <Comments> is a
// compound component, a different screen could arrange the same parts
// differently (count in a header, form above the list) without new props.
export function CommentsSection({ postId }) {
  const t = useT()
  return (
    <Comments postId={postId}>
      <section className="comments">
        <h2>{t('comments.title')}</h2>
        <p className="muted comment-count"><Comments.Count /></p>
        <Comments.List />
        <Comments.Form />
      </section>
    </Comments>
  )
}
