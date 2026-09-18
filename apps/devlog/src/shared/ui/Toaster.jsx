import { useToastStore } from '../lib/toastStore'

// Only this component subscribes to the toast list. Firing a toast from
// CommentForm does NOT re-render CommentForm, the page, or anything else.
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="toaster">
      {toasts.map((t) => (
        <button key={t.id} className={`toast toast--${t.type}`} onClick={() => dismiss(t.id)}>
          {t.message}
        </button>
      ))}
    </div>
  )
}
