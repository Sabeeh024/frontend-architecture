// Same mechanism as @repo/theme (topic 17), applied to a concern with real
// stakes: who's logged in. A plain module so a route loader guard (topic 06's
// requireAuth) can read it without a Context, and — same as theme — a
// `storage` listener so it's live across tabs of the SAME origin.
//
// This does NOT make devlog and admin share a login by itself. It makes
// TWO APPS ON THE SAME ORIGIN share one, because only then does the
// `storage` event fire between them. Two apps on two ports are still two
// origins, still two separate sessions — see NOTES/18 for the proxy that
// actually puts them on one origin.
const KEY = 'session-user'
const listeners = new Set()

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

let user = read()

export function getUser() {
  return user
}

export function setUser(value) {
  user = value
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value))
    else localStorage.removeItem(KEY)
  } catch {
    /* private browsing / storage disabled */
  }
  listeners.forEach((fn) => fn(user))
}

export function clearUser() {
  setUser(null)
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      user = e.newValue ? JSON.parse(e.newValue) : null
      listeners.forEach((fn) => fn(user))
    }
  })
}
