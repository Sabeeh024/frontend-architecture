import { PostCard } from './PostCard'

// Presentational ("dumb"): given posts, render them. No data fetching,
// no routing logic, no knowledge of where `posts` came from.
// Trivially testable and reusable (search results, a profile page, Storybook).
export function PostList({ posts }) {
  return (
    <div className="feed">
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  )
}
