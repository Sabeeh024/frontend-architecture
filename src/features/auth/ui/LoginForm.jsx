import { useState } from 'react'
import { useSession } from '../../../entities/session'
import { Button } from '../../../shared/ui/Button'

// The "authenticate" action. Owns the form; delegates the actual state
// transition to the session entity.
export function LoginForm({ onDone }) {
  const { login, pending } = useSession()
  const [name, setName] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    await login(name.trim())
    onDone?.()
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <p className="muted">Try "Ada Lovelace" or any new name.</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <Button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Continue'}</Button>
    </form>
  )
}
