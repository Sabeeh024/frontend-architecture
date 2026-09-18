import { useParams } from 'react-router-dom'

// Every in-app link needs the current locale prefixed on
// (/posts/p1 -> /en/posts/p1). One hook, used at every Link/NavLink/redirect
// call site, instead of each component reaching into useParams and
// string-templating it by hand.
export function useLocalizedPath() {
  const { locale } = useParams()
  return (path) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`
}
