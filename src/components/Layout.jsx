import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from './Avatar'
import { Button } from './Button'

export function Layout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">Devlog</Link>
        <nav>
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
    </div>
  )
}
