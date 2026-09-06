import { Link, Outlet, useNavigation } from 'react-router-dom'
import { useAuth } from '../features/auth'
import { useTheme } from '../shared/theme/ThemeProvider'
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
  const navigation = useNavigation()

  return (
    <div className="layout">
      {/* loaders block the transition until data is ready — show it */}
      <div className={`nav-progress ${navigation.state === 'loading' ? 'is-active' : ''}`} />
      <header className="topbar">
        <Link to="/" className="brand">Devlog</Link>
        <nav>
          <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>
          {user ? (
            <span className="who">
              <Link to="/settings"><Avatar name={user.name} /> {user.name}</Link>
              <Button variant="ghost" onClick={logout}>Log out</Button>
            </span>
          ) : (
            <Link to="/login">Log in</Link>
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
