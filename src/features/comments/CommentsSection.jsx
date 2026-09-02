import { Comments } from './ui/Comments'

// Default composition the posts feature drops in. Because <Comments> is a
// compound component, a different screen could arrange the same parts
// differently (count in a header, form above the list) without new props.
export function CommentsSection({ postId }) {
  return (
    <Comments postId={postId}>
      <section className="comments">
        <h2>Comments (<Comments.Count />)</h2>
        <Comments.List />
        <Comments.Form />
      </section>
    </Comments>
  )
}
