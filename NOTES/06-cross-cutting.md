# 06 — Cross-cutting concerns

Branch: `topic/06-cross-cutting` (built on `topic/05-routing`). Three commits.

```bash
git switch topic/06-cross-cutting
npm run dev      # try /settings while logged out
```

A **cross-cutting concern** is something many features touch but no feature
owns: auth, permissions, theming, feature flags, error handling, logging,
i18n, analytics. The architectural question is always the same: *where does it
live so every feature can reach it without depending on every other feature?*

---

## The rule this topic keeps hitting

**If non-React code needs the value, it can't live in Context.**

Route loaders, `queryClient` callbacks, api interceptors, plain utility
functions — none of them can call `useContext`. Cross-cutting state that any of
those need must live in a **store or plain module**:

| concern | lives in | why |
|---|---|---|
| theme | **Context** (`ThemeProvider`) | only components read it; changes rarely |
| auth | **store** (`authStore`) — was Context | the route guard (a loader) reads it |
| toasts | **store** (`toastStore`) | fired from non-component code |
| feature flags | **plain module** (`flags.js`) | read in loaders and components; static |
| comments compound state | **Context** (local to `<Comments>`) | never leaves that subtree |

Auth moving Context → store is the headline change. It also deleted a provider
(`providers.jsx` went 3 → 2) — stores need none.

---

## Route protection — three ways, one chosen

### a) `<ProtectedRoute>` wrapper component
```jsx
<Route element={<ProtectedRoute><Settings/></ProtectedRoute>} />
```
Checks auth in render, returns `<Navigate to="/login"/>`. Simple, familiar.
**Downside:** the protected component (and its data) start loading, *then* get
thrown away on redirect. The check happens too late.

### b) Loader guard  ← used here
```js
// app/routeGuards.js
export function requireAuth({ request }) {
  if (!getAuthUser())
    return redirect(`/login?next=${new URL(request.url).pathname}`)
  return null
}
// router: { path: 'settings', loader: requireAuth, … }
```
Runs **before** the route's component or data loader. Redirect happens with
nothing rendered, nothing fetched. `?next=` lets login send you back
(`<Navigate to={next}/>`). Needs auth outside React — hence the store.

### c) Framework middleware
Next.js `middleware.ts` / Remix — the check runs on the *server* before any JS
ships. Best, needs a server.

**Rule of thumb:** guard where the data is fetched. Loaders fetch in the
router, so the guard goes there too.

---

## Nested layouts (`features/settings/`)

`/settings` renders `<SettingsLayout>` into `RootLayout`'s `<Outlet/>`;
`SettingsLayout` has *its own* `<Outlet/>` for `/settings` (Profile) and
`/settings/about`. The "Settings" heading + subnav don't re-mount when you
switch tabs — only the innermost outlet swaps. Shells nest by URL depth, the
same way `<Comments.List/>`-style composition nests by JSX.

---

## Error handling — it's layered, match the layer to the blast radius

| layer | catches | blast radius | in this app |
|---|---|---|---|
| route `errorElement` | loader rejections + render errors in any route below | **whole screen** | `RouteError` on the layout route |
| `<ErrorBoundary>` (class) | render errors in its subtree | **just that subtree** | wraps `<CommentsSection>` in `PostPage` — comments can fail, article survives |
| inline (`status === 'error'`) | one query's failure | **one widget**, with context-specific UI | `PostPage` "Could not load this post" |
| try/catch + `toast.error` | an awaited action failing | **none** (just notify) | `Comments.Form` submit |

Coarser is less code, finer is better UX. Start with the route `errorElement`
(one for the whole app), add an `<ErrorBoundary>` only around a part that can
fail independently and shouldn't take its neighbours with it.

> React still has no hook for `componentDidCatch` — `ErrorBoundary` is the one
> place a class component is unavoidable (or use `react-error-boundary`).

---

## Feature flags (`shared/config/flags.js`)

```js
const flags = { reactions: true, markdownComments: false }
export const isEnabled = (name) => flags[name] ?? false
export const useFlag = (name) => isEnabled(name)
```

`PostPage` does `{useFlag('reactions') && <Reactions/>}`. Uses:
- **decouple deploy from release** — merge `markdownComments` work behind a
  `false` flag, flip it on later without a deploy
- **gradual rollout / A-B** — `isEnabled` can consult user id, %, an API
- **kill switch** — turn a broken feature off in seconds

Plain module (not Context) so a loader or the api layer can check a flag too.
If flags go dynamic (per-user, fetched), swap the module's internals for a
store — call sites using `useFlag` don't change.

---

## Loose ends from earlier topics, closed

- **`useAsync` (topics 02–03)** — deleted. React Query owns data fetching now;
  `<Async>` documents the `{ status, data, error }` shape it consumes (a
  `useQuery` result fits).
- **Context value identity (topic 04)** — `ThemeProvider` passes a fresh
  `{ theme, toggle }` each render. Harmless *here* (re-renders only on the rare
  theme change). It bites when a frequently-updating context passes an object:
  every consumer re-renders even if the field they read didn't change. Fixes:
  `useMemo` the value, or split into two contexts (state + dispatch), or move
  to a store with selectors (what toasts/auth do).
- **One store → several (topic 04)** — the app now has `authStore` +
  `toastStore`, each owning one concern, no provider. That's the normal end
  state: several small stores over one big one. Zustand "slices" are for when
  parts of *one* domain need to co-locate.
- **Provider hell (topic 05)** — down to 2, folded. Every concern moved to a
  store is one less provider.
- **Deprecated `ensureQueryData` (topic 05)** — TanStack Query v5 deprecated
  `ensureQueryData` / `fetchQuery` / `prefetchQuery` in favour of one method,
  `queryClient.query()`. `app/queryClient.js` now exposes two helpers matching
  the prefetching guide's two intents:

  ```js
  // CRITICAL — await it, block navigation, failure -> errorElement
  loadQuery(opts)      = queryClient.query({ ...opts, staleTime: 'static' })
  // SECONDARY — fire and forget, never blocks, never aborts the route
  prefetchQuery(opts)  = void queryClient.query(opts).catch(noop)
  ```

  `postLoader` now `await`s the post (`loadQuery`) and fire-and-forgets the
  comments (`prefetchQuery`) — comments still start in parallel (no waterfall),
  but a slow or failing comments fetch no longer holds up the post page.

---

## Where the app stands after 6 topics

```
app/       router · routeGuards · providers (2) · queryClient · theme (Context)
features/  auth (store) · posts · comments · settings
shared/    ui (+ ErrorBoundary) · lib (formatDate, toastStore) · config (flags) · api
```

Cross-cutting inventory: theme=Context, auth=store, toasts=store, flags=module,
errors=layered boundaries, route-guard=loader. The through-line: **push it to
the lowest layer that has no React dependency, unless only components need it.**

## Next questions this raises

- Optimistic updates (the topic-03 leftover): `useMutation`'s `onMutate` writes
  the new comment into the cache immediately, `onError` rolls back. Better
  perceived speed, real complexity — worth it for high-frequency actions, skip
  for rare ones.
- Analytics / logging are cross-cutting too — decorator around the queryClient?
  a router subscriber? an effect in `RootLayout`?
- i18n: message catalog as a module, but the *current locale* — Context or
  store? (store, if URLs or loaders are locale-aware)
- This is where topic 07 lands: none of these boundaries are *enforced*. What
  stops `shared/` importing a feature, or two features importing each other?
  → dependency rules + lint.
