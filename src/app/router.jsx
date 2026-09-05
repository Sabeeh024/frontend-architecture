import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'
import { FeedPage, PostPage } from '../features/posts'
import { LoginPage } from '../features/auth'

// The route tree IS the app's top-level architecture: every screen, its URL,
// its place in the layout hierarchy, declared in one file.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'posts/:id', element: <PostPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
])
