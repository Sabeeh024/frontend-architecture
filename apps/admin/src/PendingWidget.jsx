import { Async } from '@repo/ui'
import { usePosts } from './usePosts'

// Exposed to other apps via Module Federation (see vite.config.js `exposes`).
// Deliberately tiny and self-contained: no props, fetches its own data via
// @repo/api-client (the same package apps/devlog uses) so a host app can drop
// it in with zero wiring, the same promise packages/ui components make.
export default function PendingWidget() {
  const posts = usePosts()
  const pending = posts.data?.filter((p) => p.status === 'pending').length ?? 0

  return (
    <div className="pending-widget">
      <Async state={posts}>
        {() => (
          <p className="muted">
            <strong>{pending}</strong> post{pending === 1 ? '' : 's'} awaiting moderation
          </p>
        )}
      </Async>
    </div>
  )
}
