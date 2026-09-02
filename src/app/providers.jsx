import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from '../entities/session'

// Every global provider the app needs, composed in one place.
export function Providers({ children }) {
  return (
    <BrowserRouter>
      <SessionProvider>{children}</SessionProvider>
    </BrowserRouter>
  )
}
