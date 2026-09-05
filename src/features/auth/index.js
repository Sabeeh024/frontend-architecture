// Public API of the auth feature.
//
// LoginPage is intentionally NOT re-exported: it's a route entry, loaded via
// the router's lazy import so it lands in its own chunk.
export { useAuth } from './useAuth'
export { useAuthStore, getAuthUser } from './authStore'
