import { usePosts } from '../hooks/usePosts'
import { PostCard } from '../components/PostCard'
import { Spinner } from '../components/Spinner'

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
