import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, LoginPage } from '../features/auth'
import { FeedPage, PostPage } from '../features/posts'
import { AppLayout } from './AppLayout'

export default function App() {
  return (
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
  )
}
