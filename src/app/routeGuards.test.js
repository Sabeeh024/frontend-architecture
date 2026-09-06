import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../features/auth'
import { requireAuth } from './routeGuards'

// Layer: route loader. It's a plain function — call it with a fake request,
// assert what it returns. No router, no render.
afterEach(() => useAuthStore.setState({ user: null }))

const request = (url) => ({ request: new Request(`http://localhost${url}`) })

describe('requireAuth', () => {
  it('redirects to /login?next=<path> when signed out', () => {
    const result = requireAuth(request('/settings'))
    expect(result).toBeInstanceOf(Response)
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/login?next=%2Fsettings')
  })

  it('lets the navigation through when signed in', () => {
    useAuthStore.setState({ user: { id: 'u1', name: 'Ada Lovelace' } })
    expect(requireAuth(request('/settings'))).toBeNull()
  })
})
