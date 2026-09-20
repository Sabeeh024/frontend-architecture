import { useState } from 'react'
import { Async, Avatar, Button, ErrorBoundary, ToastList } from '@repo/ui'
import { setPostStatus } from '@repo/api-client'
import { usePosts } from './usePosts'

let seq = 0

export default function App() {
  const posts = usePosts()
  const [rows, setRows] = useState(null) // local copy once loaded, so a toggle can update it optimistically
  const [toasts, setToasts] = useState([])

  const list = rows ?? posts.data

  async function handleToggle(post) {
    const next = post.status === 'featured' ? 'pending' : 'featured'
    setRows((list ?? []).map((p) => (p.id === post.id ? { ...p, status: next } : p)))
    await setPostStatus(post.id, next)
    const id = ++seq
    setToasts((t) => [...t, { id, type: next === 'featured' ? 'success' : 'info', message: `${post.title} is now ${next}` }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <h1>Devlog Admin</h1>
        <p className="muted">Moderate posts — the SAME backend apps/devlog reads from (topic 13).</p>
      </header>

      <ErrorBoundary fallback={<p className="muted">Couldn’t load the post list.</p>}>
        <Async state={posts} empty={<p className="muted">No posts.</p>}>
          {() => (
            <ul className="post-rows">
              {list.map((post) => (
                <li key={post.id} className="post-row">
                  <Avatar name={post.author.name} />
                  <div className="post-row-main">
                    <strong>{post.title}</strong>
                    <span className="muted"> — {post.author.name}</span>
                  </div>
                  <span className={`badge badge--${post.status}`}>{post.status}</span>
                  <Button variant="ghost" onClick={() => handleToggle(post)}>
                    {post.status === 'featured' ? 'Unfeature' : 'Feature'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Async>
      </ErrorBoundary>

      <ToastList toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}
