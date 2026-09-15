import { SUPPORTED_LOCALES, useLocaleStore } from '../shared/i18n/localeStore'

// Runs on the :locale layout route, before anything under it. Two jobs:
//  1. reject an unsupported segment (/fr/posts/p1) -> the route errorElement,
//     the same 404-via-loader pattern as a missing post
//  2. sync the store + <html lang> from the URL, so components (via the
//     store) and non-React code (formatDate, a store action's toast) see the
//     locale the URL says, not whatever they last saw
export function localeLoader({ params }) {
  if (!SUPPORTED_LOCALES.includes(params.locale)) {
    throw new Response('Not Found', { status: 404, statusText: `Unsupported locale "${params.locale}"` })
  }
  useLocaleStore.getState().setLocale(params.locale)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = params.locale
  }
  return null
}
