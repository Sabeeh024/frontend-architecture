import { usePosts, PostCard } from '../../entities/post'
import { Spinner } from '../../shared/ui/Spinner'

export function FeedPage() {
  const { posts, loading } = usePosts()
  if (loading) return <Spinner label="Loading feed…" />
  return (
    <div className="feed">
      <h1>Feed</h1>
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  )
}
