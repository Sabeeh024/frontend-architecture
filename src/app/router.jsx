import { createBrowserRouter } from 'react-router-dom'
import { queryClient } from './queryClient'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'
import { postsQuery, postQuery } from '../features/posts/queries'
import { commentsQuery } from '../features/comments/queries'

// Loaders live in the app layer: they're glue between the router, the feature
// query definitions, and the queryClient. ensureQueryData = "fetch unless it's
// already fresh in cache", so a loader is cheap on repeat visits.
const feedLoader = () => queryClient.ensureQueryData(postsQuery())

const postLoader = ({ params }) =>
  // both fetches fire in parallel — no post->comments waterfall
  Promise.all([
    queryClient.ensureQueryData(postQuery(params.id)),
    queryClient.ensureQueryData(commentsQuery(params.id)),
  ]).then(([post]) => post)

// Each page is only ever imported through import() -> its own JS chunk,
// downloaded when the route is first visited.
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
    ],
  },
])
