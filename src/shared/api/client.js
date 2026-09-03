// Fake network layer: in-memory seed data + artificial latency.
// Feature api slices build on top of this; it knows nothing about features.

const LATENCY = 400

const db = {
  users: [
    { id: 'u1', name: 'Ada Lovelace' },
    { id: 'u2', name: 'Alan Turing' },
  ],
  posts: [
    { id: 'p1', authorId: 'u1', title: 'On layered architecture', body: 'Group files by what they are: api, components, hooks, pages.', createdAt: '2026-08-20T10:00:00Z' },
    { id: 'p2', authorId: 'u2', title: 'On feature slicing', body: 'Group files by what they do: everything for "posts" lives together.', createdAt: '2026-08-24T14:30:00Z' },
  ],
  comments: [
    { id: 'c1', postId: 'p1', authorId: 'u2', body: 'Breaks down once you have 30 features.', createdAt: '2026-08-21T09:00:00Z' },
  ],
}

let seq = 100
const nextId = (prefix) => `${prefix}${seq++}`

// --- request instrumentation (topic 03: makes the cost of re-fetching visible)
const listeners = new Set()
export const requestLog = { count: 0, byLabel: {} }
export function onRequest(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function fake(resolver, label = 'request') {
  requestLog.count += 1
  requestLog.byLabel[label] = (requestLog.byLabel[label] ?? 0) + 1
  listeners.forEach((fn) => fn({ ...requestLog }))
  return new Promise((resolve) => {
    setTimeout(() => resolve(resolver()), LATENCY)
  })
}

export { db, nextId }
