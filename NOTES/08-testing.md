# 08 — Testing each layer, and CI

Branch: `topic/08-testing` (built on `topic/07-boundaries`).

```bash
git switch topic/08-testing
npm test            # 20 tests, 6 files, ~1.4s
npm run lint && npm run depgraph:check && npm run build   # what CI runs
```

## Why this is an architecture topic

Every earlier note made a testability claim — "presentational components are
trivially testable", "a store is call-an-action-read-the-state", "a loader is
just a function", "compound state is covered by the widget". **Testability is a
property of the boundaries.** If a layer is hard to test in isolation, the
boundary around it is wrong. So this topic both proves the claims and stress-
tests the seams.

## Setup

- **Vitest** (same transform as the Vite build — no separate Babel/Jest config).
- **happy-dom**, not jsdom. jsdom ships its own `Request` / `AbortSignal`, and
  Node rejects them when react-router's data router builds a navigation
  `Request` (`Expected signal to be an instance of AbortSignal`). happy-dom
  doesn't override those globals.
- `src/test/setup.js` — jest-dom matchers, `cleanup()` + `resetDb()` after each.
- `src/test/utils.jsx` — `makeQueryClient()` (fresh per test, `retry: false`)
  and `renderWithProviders` (QueryClient + MemoryRouter).

### Two seams testing forced into the code — "tests drive design"

| change | why |
|---|---|
| `client.js` → `export function resetDb()` + `db` is now `let` (reassigned) | tests need the fixture reset between cases; consumers still see the new `db` via the live ES-module binding |
| `router.jsx` → `export const routes` (array) *and* `router` (instance) | tests build a `createMemoryRouter(routes)` from the exact config the app ships; the browser router is just `createBrowserRouter(routes)` |

Both are small, both make the module *more* honest about its shape. That's the
usual pattern — the awkwardness a test exposes is a real design smell.

## One test file per layer

| file | layer | how it's tested | what it proves | needs |
|---|---|---|---|---|
| `shared/lib/formatDate.test.js` | pure fn | call it, assert output | deterministic transform | nothing |
| `features/posts/PostList.test.jsx` | presentational | render with props, query the DOM | "trivially testable" — no mocks, no data layer | a Router (for `<Link>`) |
| `features/auth/authStore.test.js` | store | `store.getState().login(…)`, read `getState()` | actions + `getAuthUser()` (what the loader guard uses) | nothing — no React |
| `features/comments/useComments.test.jsx` | data hook | `renderHook` + QueryClient wrapper; real in-memory api | optimistic append, reconcile on settle, rollback on error | QueryClient |
| `app/routeGuards.test.js` | loader | call `requireAuth({ request })` with a fake `Request` | returns a 302 `Response` to `/login?next=…` when signed out, `null` when signed in | nothing |
| `app/router.test.jsx` | routes + loaders + guards wired | `createMemoryRouter(routes, { initialEntries })` + `RouterProvider` | loader data reaches the feed; guard bounces `/settings`→`/login`; `errorElement` catches an unmatched path | QueryClient + ThemeProvider |

Read top-to-bottom, the "needs" column *is* the dependency graph: pure fns need
nothing, presentational needs a Router, hooks need a QueryClient, integration
needs the lot. A layer that needed *more* than the row below it would be a
boundary violation.

### Two gotchas worth keeping

- **`formatDate` isn't actually pure** — it calls `Intl` via
  `toLocaleDateString`, so its output depends on the runner's timezone and
  locale. Pinned `TZ: 'UTC'` in the test config; locale is assumed en-US (CI).
  A function that touches `Intl`/`Date.now`/`Math.random` needs either injected
  config or a pinned environment.
- **Optimistic-update window vanishes at 0 latency** — the fake api runs
  instantly under test, so the `pending: true` row and the settled row land in
  the same tick and `waitFor` never sees the in-between. Fix: that one test
  stubs `addComment` with a promise it resolves by hand
  (`vi.mock('./api', importOriginal → { …, addComment: vi.fn(actual) })`), so
  the in-flight state is observable. The other three comment tests use the real
  api.

## Where to invest — the shape of the suite

```
        ╱ 1  router.test.jsx        integration — slow, high confidence, few
      ╱ 3   useComments             hook + cache — medium
   ╱  16    formatDate/PostList/    unit — fast, many, cheap
            authStore/routeGuards
```

Most value per line is in the middle+bottom: **presentational components and
pure logic**, because feature-based structure made them dependency-free. The
one integration test is worth its weight — it's the only thing that proves the
loaders, the guard, and the error boundary actually connect.

Not covered (deliberately): styling, the RequestMeter/Toaster dev widgets,
every route. Coverage % is not the goal — testing the *seams* is.

## CI (`.github/workflows/ci.yml`)

```
npm ci
npm run lint            # oxlint + eslint boundaries  (topic 07)
npm run depgraph:check  # whole-graph dependency rules (topic 07)
npm test               # this topic
npm run build          # it still compiles + splits
```

Topic 07 built the rules; without this file they only ran when someone
remembered to. Now a PR that puts a cycle in, leaks `shared → features`, breaks
a loader, or fails to build is red before review.

## The inside-the-app arc — now verified

```
01 structure   ── 02 composition ── 03 data ── 04 state ── 05 routing
   └── 06 cross-cutting ── 07 enforcement ── 08 tests + CI
```

Every layer has a boundary, the boundaries are linted, the behaviour is tested,
and CI runs all of it. The graph is acyclic and one-directional. That is the
precondition for **outside the app**: a feature you can lift into its own
package, a `shared/` you can publish as a design system, a route tree you can
split across separately-deployed micro-frontends — none of that is safe until
the seams inside one app are this clean.

## Next questions this raises

- MSW (Mock Service Worker) instead of the hand-rolled fake api — worth it once
  there's a real backend to mock at the network layer.
- Visual / interaction testing (Storybook + play functions, Playwright) for the
  things RTL is bad at — layout, focus, animation.
- The `boundaries` v7 deprecation noise is still there (topic 07). Migrate to
  `fileInternalPath`, or wait.
- → **outside the app.**
