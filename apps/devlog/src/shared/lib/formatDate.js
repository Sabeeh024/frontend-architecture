import { getLocale } from '../i18n/localeStore'

// Was `toLocaleDateString(undefined, …)` — locale came from whatever the
// browser/OS happened to be set to (topic 08 flagged this: a function calling
// Intl isn't actually pure). Now it reads the app's own locale store, so the
// date format follows the language the user picked in-app, not their OS.
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
