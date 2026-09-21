import { createRoot } from 'react-dom/client'
import PendingWidget from './PendingWidget'
import repoUiCss from '@repo/ui/styles.css?inline'
import widgetCss from './widget.css?inline'

const cssText = `${repoUiCss}\n${widgetCss}`

// The runtime contract a micro-frontend host needs, and nothing else: mount
// into a DOM node it hands you, unmount when it's done. No shared React, no
// build-time coupling — a host written in Vue or plain JS could call this too.
export function mount(container) {
  if (!document.getElementById('admin-widget-styles')) {
    const style = document.createElement('style')
    style.id = 'admin-widget-styles'
    style.textContent = cssText
    document.head.appendChild(style)
  }
  const root = createRoot(container)
  root.render(<PendingWidget />)
  return () => root.unmount()
}
