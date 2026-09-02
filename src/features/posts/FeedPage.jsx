import { usePosts } from './usePosts'
import { PostList } from './PostList'
import { Async } from '../../shared/ui/Async'

// Container ("smart"): owns the data, delegates every rendering decision.
// The pending/error/empty ladder lives in <Async>, not here.
export function FeedPage() {
  const posts = usePosts()
  return (
    <>
      <h1>Feed</h1>
      <Async
        state={posts}
        loading={<p className="spinner">Loading feed…</p>}
        empty={<p className="muted">No posts yet.</p>}
      >
        {(data) => <PostList posts={data} />}
      </Async>
    </>
  )
}
