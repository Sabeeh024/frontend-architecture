import { useAuth } from '../auth'
import { useTheme } from '../../app/theme/ThemeProvider'
import { Avatar } from '../../shared/ui/Avatar'

export function ProfilePage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  return (
    <div className="card">
      <p className="meta"><Avatar name={user.name} /> {user.name}</p>
      <p className="muted">User id: <code>{user.id}</code></p>
      <p className="muted">Current theme: {theme}</p>
    </div>
  )
}
