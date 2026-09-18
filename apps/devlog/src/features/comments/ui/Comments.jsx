import { createContext, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth'
import { useComments } from '../useComments'
import { Avatar } from '../../../shared/ui/Avatar'
import { Button } from '../../../shared/ui/Button'
import { Spinner } from '../../../shared/ui/Spinner'
import { formatDate } from '../../../shared/lib/formatDate'
import { toast } from '../../../shared/lib/toastStore'
import { useT, useTn } from '../../../shared/i18n/t'
import { useLocalizedPath } from '../../../shared/i18n/useLocalizedPath'

// Compound component. <Comments> holds the state; its sub-components read it
// from context. The consumer composes the pieces and controls layout:
//
//   <Comments postId={id}>
//     <Comments.List />
//     <Comments.Form />
//   </Comments>

const Ctx = createContext(null)
const useCtx = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('<Comments.*> must be used inside <Comments>')
  return v
}

export function Comments({ postId, children }) {
  const state = useComments(postId)
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>
}

Comments.List = function List() {
  const { comments, loading } = useCtx()
  const t = useT()
  if (loading) return <Spinner label={t('comments.loading')} />
  if (comments.length === 0) return <p className="muted">{t('comments.empty')}</p>
  return (
    <ul className="comment-list">
      {comments.map((c) => (
        <li key={c.id} className={c.pending ? 'is-pending' : undefined}>
          <p className="meta"><Avatar name={c.author.name} /> {c.author.name} · {formatDate(c.createdAt)}</p>
          <p>{c.body}</p>
        </li>
      ))}
    </ul>
  )
}

// Pluralized: 0/1/n each get their own phrasing (comments.count.zero/one/other
// in the catalog) instead of a bare number stuffed into a fixed sentence.
Comments.Count = function Count() {
  const { comments } = useCtx()
  const tn = useTn()
  return <>{tn('comments.count', comments.length)}</>
}

Comments.Form = function Form() {
  const { add } = useCtx()
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const t = useT()
  const to = useLocalizedPath()

  if (!user) return <p className="muted"><Link to={to('/login')}>{t('nav.login')}</Link> {t('comments.loginPrompt')}</p>

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      setBody('') // clear immediately — the optimistic comment is already showing
      await add({ body: body.trim(), author: user })
      toast.success(t('comments.posted')) // fired from deep in the tree, no wiring
    } catch {
      toast.error(t('comments.postFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('comments.placeholder')} rows={3} />
      <Button type="submit" disabled={busy}>{busy ? t('comments.posting') : t('comments.post')}</Button>
    </form>
  )
}
