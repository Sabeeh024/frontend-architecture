// Pure presentational (topic 02's split, applied at the package boundary):
// this package doesn't know toasts come from a Zustand store — it just
// renders whatever list it's handed and calls onDismiss. The app's own
// Toaster component (apps/devlog/src/shared/ui/Toaster.jsx) is the thin
// wrapper that subscribes to toastStore and passes props down. A design
// system ships the look; the app wires the data.
export function ToastList({ toasts, onDismiss }) {
  return (
    <div className="toaster">
      {toasts.map((t) => (
        <button key={t.id} className={`toast toast--${t.type}`} onClick={() => onDismiss(t.id)}>
          {t.message}
        </button>
      ))}
    </div>
  )
}
