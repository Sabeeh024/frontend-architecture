import { useNavigate } from 'react-router-dom'
import { useSession } from '../../entities/session'
import { LoginForm } from '../../features/auth'

export function LoginPage() {
  const { user } = useSession()
  const navigate = useNavigate()

  if (user) {
    navigate('/')
    return null
  }

  return (
    <div>
      <h1>Log in</h1>
      <LoginForm onDone={() => navigate('/')} />
    </div>
  )
}
