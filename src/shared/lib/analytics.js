// Cross-cutting observability. Called from components, loaders, and query
// callbacks alike — so it's a plain module, no hook, no provider.
// Real app: forward to PostHog / Segment / GA. Here: console + a ring buffer.
const buffer = []

export function track(event, props = {}) {
  const entry = { event, props, at: Date.now() }
  buffer.push(entry)
  if (buffer.length > 100) buffer.shift()
  if (import.meta.env.DEV) console.debug('[track]', event, props)
}

export const getEvents = () => [...buffer]
