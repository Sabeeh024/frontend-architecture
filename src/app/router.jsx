import { createBrowserRouter } from 'react-router-dom'
import { loadQuery, prefetchQuery } from './queryClient'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'
import { requireAuth } from './routeGuards'
import { postsQuery, postQuery } from '../features/posts/queries'
import { commentsQuery } from '../features/comments/queries'

// Loaders live in the app layer: glue between the router, the feature query
// definitions, and the queryClient.
const feedLoader = () => loadQuery(postsQuery())

const postLoader = ({ params }) => {
  // comments = secondary: start the fetch now (no post->comments waterfall)
  // but don't make the navigation wait on it, or fail if it errors.
  prefetchQuery(commentsQuery(params.id))
  // post = critical: the page is meaningless without it, so block on it.
  return loadQuery(postQuery(params.id))
}

// Each page is only imported through import() -> its own JS chunk.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        loader: feedLoader,
        lazy: async () => ({ Component: (await import('../features/posts/FeedPage')).FeedPage }),
      },
      {
        path: 'posts/:id',
        loader: postLoader,
        lazy: async () => ({ Component: (await import('../features/posts/PostPage')).PostPage }),
      },
      {
        path: 'login',
        lazy: async () => ({ Component: (await import('../features/auth/LoginPage')).LoginPage }),
      },
      {
        path: 'settings',
        loader: requireAuth, // guard runs before anything below renders
        lazy: async () => ({ Component: (await import('../features/settings')).SettingsLayout }),
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('../features/settings')).ProfilePage }),
          },
          {
            path: 'about',
            lazy: async () => ({ Component: (await import('../features/settings')).AboutPage }),
          },
        ],
      },
    ],
  },
])
