// Fake network layer: in-memory seed data + artificial latency.
// Feature api slices build on top of this; it knows nothing about features.

// No artificial delay under test — tests assert on states, not stopwatch timing.
// (A test that needs to observe an in-flight state stubs its own timing.)
const LATENCY = import.meta.env?.MODE === 'test' ? 0 : 400

const seed = () => ({
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
})

// `let`, not `const`: resetDb() reassigns it; consumers get the new value
// through the live ES-module binding.
export let db = seed()

let seq = 100
const nextId = (prefix) => `${prefix}${seq++}`

// --- request instrumentation (topic 03: makes the cost of re-fetching visible)
const listeners = new Set()
export const requestLog = { count: 0, byLabel: {} }
export function onRequest(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Test seam: restore the fixture between tests (src/test/setup.js afterEach).
export function resetDb() {
  db = seed()
  seq = 100
  requestLog.count = 0
  requestLog.byLabel = {}
}

export function fake(resolver, label = 'request') {
  requestLog.count += 1
  requestLog.byLabel[label] = (requestLog.byLabel[label] ?? 0) + 1
  listeners.forEach((fn) => fn({ ...requestLog }))
  return new Promise((resolve) => {
    setTimeout(() => resolve(resolver()), LATENCY)
  })
}

export { nextId }
