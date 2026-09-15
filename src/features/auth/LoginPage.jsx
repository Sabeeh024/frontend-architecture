import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Button } from '../../shared/ui/Button'
import { toast } from '../../shared/lib/toastStore'
import { useT } from '../../shared/i18n/t'

export function LoginPage() {
  const { user, login, pending } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const [name, setName] = useState('')
  const t = useT()

  // Already signed in? Bounce — declaratively, not during render.
  if (user) return <Navigate to={next} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const u = await login(name.trim())
    toast.success(t('login.welcome', { name: u?.name ?? name.trim() }))
    navigate(next, { replace: true })
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>{t('login.title')}</h1>
      <p className="muted">{t('login.hint')}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('login.namePlaceholder')} />
      <Button type="submit" disabled={pending}>{pending ? t('login.signingIn') : t('login.continue')}</Button>
    </form>
  )
}
