import { usePosts } from './usePosts'
import { PostList } from './PostList'
import { Async } from '../../shared/ui/Async'
import { useT } from '../../shared/i18n/t'

// Container ("smart"): owns the data, delegates every rendering decision.
// The pending/error/empty ladder lives in <Async>, not here.
export function FeedPage() {
  const posts = usePosts()
  const t = useT()
  return (
    <>
      <h1>{t('feed.title')}</h1>
      <Async
        state={posts}
        loading={<p className="spinner">{t('feed.loading')}</p>}
        empty={<p className="muted">{t('feed.empty')}</p>}
      >
        {(data) => <PostList posts={data} />}
      </Async>
    </>
  )
}
