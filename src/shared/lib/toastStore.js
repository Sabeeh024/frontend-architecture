import { create } from 'zustand'

// Toasts are the textbook "external store" case:
//  - fired from anywhere (a form deep in the tree, an api error handler)
//  - rendered once at the root
//  - changes often, but only <Toaster> cares about the list
//
// Context would work, but every state push re-renders every consumer of the
// context. A store lets components subscribe to *slices* (selectors) and the
// firing code doesn't need to be a React component at all.

let seq = 0

export const useToastStore = create((set) => ({
  toasts: [],
  push: (message, type = 'info') => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// Plain-function API for non-component call sites.
export const toast = {
  success: (m) => useToastStore.getState().push(m, 'success'),
  error: (m) => useToastStore.getState().push(m, 'error'),
  info: (m) => useToastStore.getState().push(m, 'info'),
}
