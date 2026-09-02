import { Routes, Route } from 'react-router-dom'
import { FeedPage } from '../pages/feed'
import { PostPage } from '../pages/post'
import { LoginPage } from '../pages/login'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<FeedPage />} />
      <Route path="/posts/:id" element={<PostPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
