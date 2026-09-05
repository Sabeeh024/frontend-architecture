// Public API of the auth feature. Other features import from here only —
// never reach into auth/AuthContext.jsx or auth/api.js directly.
//
// LoginPage is intentionally NOT re-exported: it's a route entry, loaded only
// via the router's lazy import so it lands in its own chunk. Barrelling it here
// would pull it into the main bundle alongside AuthProvider.
export { AuthProvider } from './AuthContext'
export { useAuth } from './useAuth'
