import { create } from 'zustand'

// Same reasoning as the auth store (topic 06): the *current locale* has to be
// readable outside React — formatDate (a plain function) and, in a
// production app, the router's loaders (a locale-prefixed URL, e.g.
// /es/posts/p1, would decide the locale before any component renders).
// Context can't do that; a store can.
export const SUPPORTED_LOCALES = ['en', 'es']
const DEFAULT_LOCALE = 'en'

function readInitial() {
  try {
    const saved = localStorage.getItem('locale')
    if (SUPPORTED_LOCALES.includes(saved)) return saved
  } catch {
    /* private mode */
  }
  return DEFAULT_LOCALE
}

export const useLocaleStore = create((set) => ({
  locale: readInitial(),
  setLocale: (locale) => {
    if (!SUPPORTED_LOCALES.includes(locale)) return
    set({ locale })
    try {
      localStorage.setItem('locale', locale)
    } catch {
      /* private mode */
    }
  },
}))

// Non-hook accessor — for formatDate, loaders, anywhere outside a component.
export const getLocale = () => useLocaleStore.getState().locale
