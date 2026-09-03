import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, LoginPage } from '../features/auth'
import { FeedPage, PostPage } from '../features/posts'
import { AppLayout } from './AppLayout'
import { queryClient } from './queryClient'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<FeedPage />} />
              <Route path="/posts/:id" element={<PostPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
