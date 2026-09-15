import { Link, Outlet, useNavigation } from 'react-router-dom'
import { useAuth } from '../features/auth'
import { useTheme } from '../shared/theme/ThemeProvider'
import { useLocaleStore, SUPPORTED_LOCALES } from '../shared/i18n/localeStore'
import { useT } from '../shared/i18n/t'
import { Avatar } from '../shared/ui/Avatar'
import { Button } from '../shared/ui/Button'
import { RequestMeter } from '../shared/ui/RequestMeter'
import { Toaster } from '../shared/ui/Toaster'

// The layout route's element. Everything shared across screens lives here;
// <Outlet/> is the hole the matched child route renders into. Nest more
// layout routes to get nested shells (e.g. a /settings sub-nav).
export function RootLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { locale, setLocale } = useLocaleStore()
  const t = useT()
  const navigation = useNavigation()

  const nextLocale = SUPPORTED_LOCALES[(SUPPORTED_LOCALES.indexOf(locale) + 1) % SUPPORTED_LOCALES.length]

  return (
    <div className="layout">
      {/* loaders block the transition until data is ready — show it */}
      <div className={`nav-progress ${navigation.state === 'loading' ? 'is-active' : ''}`} />
      <header className="topbar">
        <Link to="/" className="brand">Devlog</Link>
        <nav>
          <Button variant="ghost" onClick={() => setLocale(nextLocale)} aria-label={t('nav.toggleLocale')}>
            {locale.toUpperCase()}
          </Button>
          <Button variant="ghost" onClick={toggle} aria-label={t('nav.toggleTheme')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>
          {user ? (
            <span className="who">
              <Link to="/settings"><Avatar name={user.name} /> {user.name}</Link>
              <Button variant="ghost" onClick={logout}>{t('nav.logout')}</Button>
            </span>
          ) : (
            <Link to="/login">{t('nav.login')}</Link>
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
