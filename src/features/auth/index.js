// Public API of the auth feature. Other features import from here only —
// never reach into auth/AuthContext.jsx or auth/api.js directly.
export { AuthProvider } from './AuthContext'
export { useAuth } from './useAuth'
export { LoginPage } from './LoginPage'
