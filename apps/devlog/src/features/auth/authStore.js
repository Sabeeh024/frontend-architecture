import { create } from 'zustand'
import { getUser, setUser, clearUser, subscribe as subscribeSession } from '@repo/session'
import { track } from '../../shared/lib/analytics'
import { login as loginApi } from './api'

// Auth moved from Context to a store for one concrete reason: route loaders
// run OUTSIDE React, so they can't call useContext. A store can be read from
// anywhere — a loader guard, an api interceptor, a component.
// (It also needs no <Provider>, which is why providers.jsx shrank.)
//
// Topic 18: the user field is now backed by @repo/session (persisted +
// storage-event-synced, same mechanism as @repo/theme in topic 17) instead of
// living only in this store's in-memory state. That's what makes the session
// survive a reload, and — on the same origin — makes it visible to admin too.
export const useAuthStore = create((set) => ({
  user: getUser(),
  pending: false,

  login: async (name) => {
    set({ pending: true })
    try {
      const u = await loginApi(name)
      setUser(u)
      set({ user: u })
      track('login', { userId: u.id }) // cross-cutting concern #3: inline call site
      return u
    } finally {
      set({ pending: false })
    }
  },

  logout: () => {
    clearUser()
    set({ user: null })
  },
}))

// Keep the store in sync when @repo/session changes from outside this store
// (another tab, or — on a shared origin — another app entirely).
subscribeSession((user) => useAuthStore.setState({ user }))

// Non-hook accessor for loaders / plain functions.
export const getAuthUser = () => useAuthStore.getState().user
