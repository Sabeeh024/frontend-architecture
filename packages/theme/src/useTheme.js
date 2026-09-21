import { useSyncExternalStore } from 'react'
import { getTheme, subscribe, toggleTheme } from './store'

// The hook form, for symmetry with devlog's i18n (topic 09): components use
// this, non-component code (a loader, an analytics call) uses the plain
// store functions directly.
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme)
  return { theme, toggle: toggleTheme }
}
