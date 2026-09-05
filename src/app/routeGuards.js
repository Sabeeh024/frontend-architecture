import { redirect } from 'react-router-dom'
import { getAuthUser } from '../features/auth'

// A loader guard: runs before the protected route renders. Because auth is a
// store (not Context), the guard can read it here, outside React.
// Returning a redirect() from a loader aborts navigation and goes elsewhere.
export function requireAuth({ request }) {
  if (!getAuthUser()) {
    const next = new URL(request.url).pathname
    return redirect(`/login?next=${encodeURIComponent(next)}`)
  }
  return null
}
