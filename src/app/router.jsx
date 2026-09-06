import { createBrowserRouter } from 'react-router-dom'
import { loadQuery, prefetchQuery } from './queryClient'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'
import { requireAuth } from './routeGuards'
import { track } from '../shared/lib/analytics'
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

// The route tree, separate from the router instance so tests can build a
// createMemoryRouter from the same config. Each page is imported only through
// import() -> its own JS chunk.
export const routes = [
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
]

export const router = createBrowserRouter(routes)

// Cross-cutting concern #2: observability via a *router subscriber*. Every
// completed navigation, in one place, without touching a single route.
router.subscribe((state) => {
  if (state.navigation.state === 'idle') {
    track('navigate', { pathname: state.location.pathname })
  }
})
