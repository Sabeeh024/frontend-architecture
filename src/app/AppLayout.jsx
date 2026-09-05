import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth'
import { useTheme } from './theme/ThemeProvider'
import { Avatar } from '../shared/ui/Avatar'
import { Button } from '../shared/ui/Button'
import { RequestMeter } from '../shared/ui/RequestMeter'
import { Toaster } from '../shared/ui/Toaster'

export function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">Devlog</Link>
        <nav>
          <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>
          {user ? (
            <span className="who">
              <Avatar name={user.name} /> {user.name}
              <Button variant="ghost" onClick={logout}>Log out</Button>
            </span>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <RequestMeter />
      <Toaster />
    </div>
  )
}
