import { RouterProvider } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Providers } from './providers'
import { router } from './router'

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </Providers>
  )
}
