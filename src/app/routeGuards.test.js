import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../features/auth'
import { requireAuth } from './routeGuards'

// Layer: route loader. It's a plain function — call it with a fake request
// (and params, since it's nested under :locale), assert what it returns.
// No router, no render.
afterEach(() => useAuthStore.setState({ user: null }))

const args = (url, locale = 'en') => ({
  request: new Request(`http://localhost${url}`),
  params: { locale },
})

describe('requireAuth', () => {
  it('redirects to /<locale>/login?next=<path> when signed out', () => {
    const result = requireAuth(args('/en/settings'))
    expect(result).toBeInstanceOf(Response)
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/en/login?next=%2Fen%2Fsettings')
  })

  it('keeps the current locale in the redirect', () => {
    const result = requireAuth(args('/es/settings', 'es'))
    expect(result.headers.get('Location')).toBe('/es/login?next=%2Fes%2Fsettings')
  })

  it('lets the navigation through when signed in', () => {
    useAuthStore.setState({ user: { id: 'u1', name: 'Ada Lovelace' } })
    expect(requireAuth(args('/en/settings'))).toBeNull()
  })
})
