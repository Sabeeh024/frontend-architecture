# 18 — Shared origin: closing topic 17's gap

Branch: `topic/18-shared-origin` (built on `topic/17-cross-app-concerns`).

```bash
git switch topic/18-shared-origin
cd apps/admin  && npm run dev -- --port 5174   # must be running for the proxy target
cd apps/devlog && npm run dev -- --port 5173   # new terminal — this is the one origin
```

Open `http://localhost:5173/`, log in, then open `http://localhost:5173/admin/`
in the same browser — same user, no second login. Now open
`http://localhost:5174/admin/` directly (bypassing devlog's proxy) — back to
"not signed in", same code, same package, different origin.

---

## The gap this closes

Topic 17 built `@repo/theme` and proved a real boundary: same-origin tabs
sync a store live via the `storage` event; two different apps on two
different ports don't, because they're two different browser origins.
The notes described four fixes and built none of them. This topic builds the
cheapest one — **put both apps on the same origin** — and, using the same
storage-event mechanism from topic 17, applies it to something with real
stakes: whether logging into devlog also logs you into admin.

---

## The fix: a dev-server proxy, not a new mechanism

```js
// apps/devlog/vite.config.js
server: {
  proxy: {
    '/admin': { target: 'http://localhost:5174', changeOrigin: true, ws: true },
  },
},
```

```js
// apps/admin/vite.config.js
export default defineConfig({
  base: '/admin/',   // matches the path devlog mounts this app under
  plugins: [react()],
})
```

Devlog's dev server becomes the single entry point (`:5173`). A request to
`/admin/*` is forwarded to admin's own dev server (`:5174`) and the response
handed back — transparently to the browser, which only ever sees one origin,
`http://localhost:5173`. `base: '/admin/'` is what makes admin's own asset
URLs (`/admin/src/main.jsx`, `/admin/@vite/client`, …) resolve once a request
arrives already carrying that prefix. **No new sync mechanism was written for
this topic** — `@repo/theme` and the new `@repo/session` package both already
had the `storage`-event listener from topic 17's pattern; putting both apps
on one origin is the only thing that changes.

This is exactly the first fix topic 17's notes listed ("same top-level
origin... the most common real-world fix, and the one that costs the least
new code — it's a deploy/reverse-proxy decision, not an app one") — proven
out here with the smallest version of that idea a local dev setup can offer.
A real deployment would do the equivalent with an actual reverse proxy
(nginx, a cloud load balancer, a Next.js `rewrites` config) in front of two
independently deployed apps; the browser-facing result is identical.

---

## `@repo/session`: the same shape as `@repo/theme`, on purpose

```js
// packages/session/src/store.js
const KEY = 'session-user'
export function setUser(value) { user = value; localStorage.setItem(KEY, JSON.stringify(value)); notify() }
window.addEventListener('storage', (e) => { if (e.key === KEY) { user = JSON.parse(e.newValue); notify() } })
```

devlog's `authStore` (topic 06 — Context → store, because a loader needs it)
now backs its `user` field with this: `login`/`logout` call
`setUser`/`clearUser`, and the store subscribes to session changes so
anything that flips `session-user` from outside — another tab, or now
another *app* — updates devlog's own state too.

Admin never needed a login of its own. It reads the session **read-only**
via `useSession()` and gates its whole moderation UI behind it — a real,
small instance of the pattern any second frontend to an existing login
would need: "is someone signed in here, and who," answered by a store, not
a duplicated auth flow.

---

## What this deliberately doesn't build

- **Any actual authorization** — anyone signed into devlog can see admin's
  moderation panel once the origin is shared. No role check exists (the
  `login` API in `packages/api-client` has no `role` field at all). Fine for
  a demo where "logged in" already gates settings pages in devlog; the honest
  next step for a real admin panel is exactly this — see below.
- **A production reverse proxy** — this topic's proxy is Vite's dev-only
  `server.proxy`, which doesn't exist once these apps are built and deployed.
  A real deploy needs its own reverse proxy or platform routing rule doing
  the same job; nothing about `@repo/session`'s code changes, only the
  infrastructure in front of it.
- **Session expiry, refresh, or a real token** — `session-user` is a whole
  user object in plaintext `localStorage`, fine for a fake in-memory backend,
  not a pattern to carry into a real app (a real session needs an
  httpOnly cookie the JS layer can't read at all — see below).

**`@repo/theme` re-verified under the same proxy, for free:** toggling
devlog's theme (`http://localhost:5173/`) flips
`http://localhost:5173/admin/` live too, with zero changes to
`packages/theme` — it never depended on anything session-specific, just the
same origin. One shared-origin fix repaired both concerns from topic 17 at
once, which is the actual payoff of fixing the boundary itself instead of
patching each store individually.

## Next questions this raises

- **Role-based access** — the honest gap this topic surfaces: `useSession()`
  answers "who," not "may they." A real admin panel needs the api-client's
  `login` to return a role and admin's gate to check it, not just presence
  of a user. Small addition, deliberately left out here to keep the origin
  question isolated from the authorization question.
- **`localStorage` vs an httpOnly cookie** — this topic's session is
  readable by any script on the page, the exact thing a real session cookie
  is designed to prevent (XSS can't steal what JS can't read). The
  `storage`-event trick this topic depends on doesn't exist for httpOnly
  cookies; a real cross-app session more likely reads a shared cookie on
  each request/page-load rather than subscribing to a live browser event —
  a materially different design this topic's scope didn't require.
