import { create } from 'zustand'
import { track } from '../../shared/lib/analytics'
import { login as loginApi } from './api'

// Auth moved from Context to a store for one concrete reason: route loaders
// run OUTSIDE React, so they can't call useContext. A store can be read from
// anywhere — a loader guard, an api interceptor, a component.
// (It also needs no <Provider>, which is why providers.jsx shrank.)
export const useAuthStore = create((set) => ({
  user: null,
  pending: false,

  login: async (name) => {
    set({ pending: true })
    try {
      const u = await loginApi(name)
      set({ user: u })
      track('login', { userId: u.id }) // cross-cutting concern #3: inline call site
      return u
    } finally {
      set({ pending: false })
    }
  },

  logout: () => set({ user: null }),
}))

// Non-hook accessor for loaders / plain functions.
export const getAuthUser = () => useAuthStore.getState().user
