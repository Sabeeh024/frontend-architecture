import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from './authStore'

// Same shape components already expected: { user, pending, login, logout }.
// useShallow => this component only re-renders when one of those fields changes.
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({ user: s.user, pending: s.pending, login: s.login, logout: s.logout })),
  )
}
