import { createBrowserRouter } from 'react-router-dom'
import { loadQuery } from './queryClient'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'
import { requireAuth } from './routeGuards'
import { postsQuery, postQuery } from '../features/posts/queries'
import { commentsQuery } from '../features/comments/queries'

// Loaders live in the app layer: glue between the router, the feature query
// definitions, and the queryClient. loadQuery returns cached data on a hit and
// fetches on a miss, so a loader is cheap on repeat visits.
const feedLoader = () => loadQuery(postsQuery())

const postLoader = ({ params }) =>
  Promise.all([
    loadQuery(postQuery(params.id)),
    loadQuery(commentsQuery(params.id)),
  ]).then(([post]) => post)

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
