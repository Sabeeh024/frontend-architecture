import { create } from 'zustand'

// The URL is now the source of truth for locale (app/router.jsx: every route
// sits under /:locale). This store is the *bridge* to non-route code that
// still needs to read it synchronously — formatDate, a toast fired from a
// store action, anything outside a component. app/localeLoader.js keeps it in
// sync with the URL on every navigation; nothing else should call setLocale.
export const SUPPORTED_LOCALES = ['en', 'es']
export const DEFAULT_LOCALE = 'en'

export const useLocaleStore = create((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => {
    if (!SUPPORTED_LOCALES.includes(locale)) return
    set({ locale })
    try {
      localStorage.setItem('locale', locale) // remembered for the *next* visit's redirect only
    } catch {
      /* private mode */
    }
  },
}))

// Non-hook accessor — for formatDate, loaders, anywhere outside a component.
export const getLocale = () => useLocaleStore.getState().locale

// Called once, by the root "/" route's loader, to pick where to redirect a
// bare visit: last-used locale (localStorage) > browser language > default.
// Never called again after that — every subsequent navigation carries the
// locale in the URL already.
export function resolveLocale() {
  try {
    const saved = localStorage.getItem('locale')
    if (SUPPORTED_LOCALES.includes(saved)) return saved
  } catch {
    /* private mode */
  }
  const browser = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : null
  if (SUPPORTED_LOCALES.includes(browser)) return browser
  return DEFAULT_LOCALE
}
