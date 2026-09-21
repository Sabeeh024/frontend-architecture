import { useAuth } from '../auth'
import { useTheme } from '@repo/theme'
import { Avatar } from '@repo/ui'
import { useT } from '../../shared/i18n/t'

export function ProfilePage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const t = useT()
  return (
    <div className="card">
      <p className="meta"><Avatar name={user.name} /> {user.name}</p>
      <p className="muted">{t('settings.userId')} <code>{user.id}</code></p>
      <p className="muted">{t('settings.currentTheme')} {theme}</p>
    </div>
  )
}
