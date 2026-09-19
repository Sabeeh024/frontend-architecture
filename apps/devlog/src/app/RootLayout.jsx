import { Link, Outlet, useLocation, useNavigate, useNavigation, useParams } from 'react-router-dom'
import { useAuth } from '../features/auth'
import { useTheme } from '../shared/theme/ThemeProvider'
import { SUPPORTED_LOCALES } from '../shared/i18n/localeStore'
import { useT } from '../shared/i18n/t'
import { useLocalizedPath } from '../shared/i18n/useLocalizedPath'
import { Avatar, Button } from '@repo/ui'
import { RequestMeter } from '../shared/ui/RequestMeter'
import { Toaster } from '../shared/ui/Toaster'

// The layout route's element. Everything shared across screens lives here;
// <Outlet/> is the hole the matched child route renders into. Nest more
// layout routes to get nested shells (e.g. a /settings sub-nav).
export function RootLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { locale } = useParams() // the URL, not the store, is the source of truth
  const t = useT()
  const to = useLocalizedPath()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const location = useLocation()

  const nextLocale = SUPPORTED_LOCALES[(SUPPORTED_LOCALES.indexOf(locale) + 1) % SUPPORTED_LOCALES.length]
  // Switching locale navigates to the *same page* under the other prefix —
  // /es/posts/p1 -> /en/posts/p1 — not just a store flip. localeLoader
  // re-validates + re-syncs the store when the param changes.
  const switchLocale = () => navigate(location.pathname.replace(`/${locale}`, `/${nextLocale}`) + location.search)

  return (
    <div className="layout">
      {/* loaders block the transition until data is ready — show it */}
      <div className={`nav-progress ${navigation.state === 'loading' ? 'is-active' : ''}`} />
      <header className="topbar">
        <Link to={to('/')} className="brand">Devlog</Link>
        <nav>
          <Button variant="ghost" onClick={switchLocale} aria-label={t('nav.toggleLocale')}>
            {locale.toUpperCase()}
          </Button>
          <Button variant="ghost" onClick={toggle} aria-label={t('nav.toggleTheme')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>
          {user ? (
            <span className="who">
              <Link to={to('/settings')}><Avatar name={user.name} /> {user.name}</Link>
              <Button variant="ghost" onClick={logout}>{t('nav.logout')}</Button>
            </span>
          ) : (
            <Link to={to('/login')}>{t('nav.login')}</Link>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <RequestMeter />
      <Toaster />
    </div>
  )
}
