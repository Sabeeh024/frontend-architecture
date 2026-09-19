import { ToastList } from '@repo/ui'
import { useToastStore } from '../lib/toastStore'

// The app-owned half of the split described in packages/ui/src/ToastList.jsx:
// this component knows about toastStore, the package's component doesn't.
// Only this component subscribes to the toast list — firing a toast from
// CommentForm does NOT re-render CommentForm, the page, or anything else.
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return <ToastList toasts={toasts} onDismiss={dismiss} />
}
