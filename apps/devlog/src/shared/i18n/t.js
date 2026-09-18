import { getLocale, useLocaleStore } from './localeStore'
import en from './messages/en'
import es from './messages/es'

const catalogs = { en, es }
const FALLBACK = 'en'

// {name} -> vars.name. No ICU, no nesting — a real app reaches for
// react-intl / next-intl / lingui once it needs plurals-by-language-rule,
// rich text, or number/date formatting beyond what Intl already gives us.
function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`))
}

function translate(locale, key, vars) {
  const str = catalogs[locale]?.[key] ?? catalogs[FALLBACK][key]
  if (str === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}"`)
    return key
  }
  return interpolate(str, vars)
}

// Plain-function API — usable outside components (a loader, formatDate,
// a toast fired from a store action).
export function t(key, vars) {
  return translate(getLocale(), key, vars)
}

// key + count -> key.zero / key.one / key.other. Cheap English/Spanish-shaped
// pluralization, not a substitute for real CLDR plural rules (languages like
// Arabic or Polish have more than three forms).
export function tn(key, count, vars) {
  const suffix = count === 0 ? 'zero' : count === 1 ? 'one' : 'other'
  return t(`${key}.${suffix}`, { count, ...vars })
}

// Hook form: subscribes to the locale so the component re-renders on switch.
// The returned functions are the same plain t/tn — only the subscription
// differs from the non-component API above.
export function useT() {
  useLocaleStore((s) => s.locale)
  return t
}

export function useTn() {
  useLocaleStore((s) => s.locale)
  return tn
}
