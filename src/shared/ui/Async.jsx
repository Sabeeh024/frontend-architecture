import { Spinner } from './Spinner'

// Render-prop + slots. Wraps a useAsync() result and owns the
// pending / error / empty / success ladder so screens don't repeat it.
//
//   <Async state={postsState} empty={<p>No posts</p>}>
//     {(posts) => <PostList posts={posts} />}
//   </Async>
export function Async({
  state,
  children,
  loading = <Spinner />,
  error = (e) => <p className="muted">Something went wrong: {String(e?.message ?? e)}</p>,
  empty = null,
  isEmpty = (data) => Array.isArray(data) && data.length === 0,
}) {
  if (state.status === 'pending') return loading
  if (state.status === 'error') return typeof error === 'function' ? error(state.error) : error
  if (empty && isEmpty(state.data)) return empty
  return children(state.data)
}
