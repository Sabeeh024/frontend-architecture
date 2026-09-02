import { Providers } from './providers'
import { AppRouter } from './router'
import { Navbar } from '../widgets/navbar'

export default function App() {
  return (
    <Providers>
      <div className="layout">
        <Navbar />
        <main><AppRouter /></main>
      </div>
    </Providers>
  )
}
