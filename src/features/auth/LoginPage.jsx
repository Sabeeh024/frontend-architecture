import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Button } from '../../shared/ui/Button'
import { toast } from '../../shared/lib/toastStore'

export function LoginPage() {
  const { user, login, pending } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  if (user) {
    navigate('/')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const user = await login(name.trim())
    toast.success(`Welcome, ${user?.name ?? name.trim()}`)
    navigate('/')
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Log in</h1>
      <p className="muted">Try "Ada Lovelace" or any new name.</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <Button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Continue'}</Button>
    </form>
  )
}
