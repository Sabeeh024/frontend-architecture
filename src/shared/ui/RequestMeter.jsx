import { useEffect, useState } from 'react'
import { requestLog, onRequest } from '../api/client'

// Dev-only: shows how many network round-trips the app has made so far,
// broken down by endpoint. Watch this climb as you navigate.
export function RequestMeter() {
  const [log, setLog] = useState({ ...requestLog })
  useEffect(() => {
    setLog({ ...requestLog }) // catch requests fired before this subscribed
    return onRequest(setLog)
  }, [])

  return (
    <footer className="request-meter">
      <strong>{log.count}</strong> requests
      <ul>
        {Object.entries(log.byLabel).map(([label, n]) => (
          <li key={label}><code>{label}</code> × {n}</li>
        ))}
      </ul>
    </footer>
  )
}
