# 05 — Routing as architecture

Branch: `topic/05-routing` (built on `topic/04-state`). Two commits:

1. **data router** — `createBrowserRouter`, layout route + `<Outlet/>`, one
   `errorElement`, provider fold.
2. **loaders + code splitting** — routes own their data and their bundle.

```bash
git switch topic/05-routing
npm run build      # see the per-route chunks
npm run dev
```

---

## The shift: routes are the app's real top-level structure

Before, routing was JSX buried in `App.jsx`:

```jsx
<BrowserRouter><AuthProvider><AppLayout>
  <Routes>
    <Route path="/" element={<FeedPage />} />
    …
```

The route was *just* "which component renders". Everything else — the data it
needs, the layout it sits in, what happens on error — was scattered into the
components. The **data router** turns a route into a full unit:

```js
// app/router.jsx — the whole app's shape in one file
{
  path: '/', element: <RootLayout/>, errorElement: <RouteError/>,
  children: [
    { index: true,          loader: feedLoader, lazy: () => import('…/FeedPage') },
    { path: 'posts/:id',     loader: postLoader, lazy: () => import('…/PostPage') },
    { path: 'login',                             lazy: () => import('…/LoginPage') },
  ],
}
```

A route now declares: **URL + layout position + data + code + error handling.**

---

## 1. Nested layouts (`<Outlet/>`)

`RootLayout` renders the shared shell (nav, theme toggle, toaster, request
meter) once, with `<Outlet/>` as the hole the matched child fills. The layout
component doesn't re-mount between `/` and `/posts/p1` — only the outlet content
swaps.

Nest deeper for sub-shells: a `settings` route with its own `<SettingsLayout>`
(sidebar) whose children (`/settings/profile`, `/settings/billing`) render into
*its* outlet. Layouts compose the same way components do, but keyed to URL depth.

## 2. One error boundary for everything below

`errorElement` on the layout route catches **both** render errors and **loader
rejections** for every child route. `RouteError` reads `useRouteError()`.
No `try/catch` in `PostPage`, no per-screen error state. A loader that does
`throw new Response('Not found', { status: 404 })` lands here typed.

## 3. Loaders — the route owns its data

```js
const postLoader = ({ params }) =>
  Promise.all([
    queryClient.ensureQueryData(postQuery(params.id)),
    queryClient.ensureQueryData(commentsQuery(params.id)),   // parallel!
  ]).then(([post]) => post)
```

What changes:

| before (fetch in component) | after (loader) |
|---|---|
| component mounts → `useEffect`/`useQuery` fires → spinner → data | data fetched **before** the component renders; no spinner on navigation |
| `PostPage` renders → `CommentsSection` mounts → *then* comments fetch (**waterfall**) | post + comments fire **in parallel** in the loader |
| loading state in every screen | `useNavigation().state === 'loading'` → one global progress bar |
| back button = refetch + re-flash | loader hits warm cache (`ensureQueryData`), instant |

**Loaders + React Query together, not instead:** the loader calls
`ensureQueryData` (prime the cache); the component still calls `useQuery` with
the *same key* (subscribe, get updates, refetch-on-stale, mutations/invalidation
from topic 03). `features/*/queries.js` holds the one shared definition so the
key can't drift.

> Pure-loader alternative: skip React Query, `return getPost(id)` from the
> loader, read with `useLoaderData()`. Less machinery, but you lose the shared
> cache, background refetch, and mutation invalidation. Fine for simple apps.

## 4. Code splitting per route

Every page is imported **only** via `lazy: () => import(...)`, so the bundler
gives each its own chunk, fetched on first visit:

```
main bundle   328 KB → 214 KB
FeedPage      1.2 KB   (loaded when you hit /)
PostPage      4.9 KB   (loaded when you open a post — pulls the comments feature with it)
LoginPage     0.7 KB
```

Gotcha hit here: `features/auth/index.js` re-exported `LoginPage`, and
`AuthProvider` (always loaded) comes from the same barrel — so Vite couldn't
split `LoginPage` out (`INEFFECTIVE_DYNAMIC_IMPORT`). Fix: the barrel exports
only the feature's *programmatic* API (`AuthProvider`, `useAuth`); `LoginPage`
is a **route entry**, imported straight by the router. Lesson: barrels and
code-splitting fight — keep route-component exports out of the barrel.

The `loader` stays eagerly imported (it's tiny — just query defs) so the data
fetch starts the instant you click, in parallel with the component chunk
download.

---

## Framework routers (Next.js / Remix / TanStack Router) — same ideas, further

Everything above is what file-based framework routers give you by default, plus:

- **file = route**: `app/posts/[id]/page.tsx` instead of a config array
- **loaders run on the server** (RSC / Remix `loader`): the browser gets HTML
  with data already in it — no client fetch at all for the first paint
- **layouts nest by folder**: `app/settings/layout.tsx` wraps everything under it
- **the component can be async** and `await` its data directly (RSC)

The trade-off is a server (or build-time render) and a heavier framework. A
Vite SPA with the data router gets you ~80% of the architecture with none of
the infra.

---

## Where the app stands after 5 topics

```
app/        router (route tree = app shape) · providers (folded) · queryClient · theme
features/   auth · posts · comments   — each: api, queries, hooks, ui, public index
shared/     ui kit · lib (formatDate, toastStore, useAsync) · api client
```

- **structure**: feature-based (topic 01)
- **composition**: headless hooks + presentational components + one compound (02)
- **server state**: React Query cache, keyed, shared (03)
- **client state**: useState / Context (theme, auth) / store (toasts) (04)
- **routing**: data router — routes own layout, data, code, errors (05)

## Next questions this raises

- Auth is a client Context, but route protection (redirect `/login` if not
  signed in) wants to happen in a **loader**, before render — how do loaders
  read context they're outside of? (pass the queryClient/store, not Context)
- `useAsync` is now dead code (React Query replaced it). Delete, or keep as
  reference?
- The route config is hand-written. At 40 routes, file-based generation vs
  explicit config — same layered-vs-feature trade-off from topic 01.
- Testing: loaders and route trees need their own testing approach
  (`createMemoryRouter`).
