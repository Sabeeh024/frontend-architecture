import { Link } from 'react-router-dom'
import { useSession } from '../../entities/session'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'

export function Navbar() {
  const { user, logout } = useSession()
  return (
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
  )
}
