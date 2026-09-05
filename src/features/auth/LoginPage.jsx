import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Button } from '../../shared/ui/Button'
import { toast } from '../../shared/lib/toastStore'

export function LoginPage() {
  const { user, login, pending } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const [name, setName] = useState('')

  // Already signed in? Bounce — declaratively, not during render.
  if (user) return <Navigate to={next} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const u = await login(name.trim())
    toast.success(`Welcome, ${u?.name ?? name.trim()}`)
    navigate(next, { replace: true })
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
