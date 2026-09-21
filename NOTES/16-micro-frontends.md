# 16 — Micro-frontends

Branch: `topic/16-micro-frontends` (built on `topic/15-versioning`).

```bash
git switch topic/16-micro-frontends
cd apps/admin && npm run build:widget && npx vite preview --config vite.widget.config.js --port 4174
# new terminal
cd apps/devlog && npm run dev   # open the feed — "N posts awaiting moderation" loads from admin, live
```

Kill the admin preview and reload devlog: the widget's spot degrades to a
one-line message, the rest of the feed is unaffected.

---

## The question this topic answers

Topics 10–15 built a monorepo: one `npm install`, one CI run, packages shared
at **build time** (`@repo/ui` gets bundled into whatever imports it, `admin`
and `devlog` are compiled and deployed as units). That's "outside the app" in
the loosest sense — still one release train.

Micro-frontends push further: can two apps compose **at runtime**, as
independently built, independently deployed artifacts, with neither app in
the other's build graph? Concretely — admin ships a widget; devlog shows it
in production without a devlog rebuild, without devlog's `package.json`
knowing admin exists.

---

## What got built

`apps/admin` now has two build outputs from the same source:

| build | command | output | consumed by |
|---|---|---|---|
| the admin app itself | `npm run build` | `dist/` (unchanged from topic 12) | deployed as its own site |
| **the widget** | `npm run build:widget` | `dist-widget/widget.js` — one file | **loaded at runtime by devlog** |

`vite.widget.config.js` is library mode: entry is `src/widget-entry.jsx`,
format `es`, one output file. It bundles its **own copy of React** — no
`external`, no shared-scope negotiation with the host. The exported contract
is two functions and nothing else:

```js
// apps/admin/src/widget-entry.jsx
export function mount(container) {
  const root = createRoot(container)
  root.render(<PendingWidget />)
  return () => root.unmount()   // returned "unmount" closes the loop
}
```

`PendingWidget` (`apps/admin/src/PendingWidget.jsx`) fetches its own data via
`@repo/api-client` — the same package `apps/devlog` uses (topic 13) — so it
needs zero props. A host in a different language could call `mount()` and
it would still work.

Devlog's side (`shared/remotes/AdminModerationWidget.jsx`) is a plain
`import()` of a URL, wrapped the same way every other risky async boundary in
this app is (topic 06's pattern, reused exactly):

```js
const RemotePendingWidget = 'http://localhost:4174/widget.js'
useEffect(() => {
  import(/* @vite-ignore */ WIDGET_URL).then((mod) => mod.mount(ref.current))
}, [])
```

wrapped in `<ErrorBoundary><Suspense>…` — if admin's widget server is down,
the `import()` rejects, the boundary catches it, the rest of the feed is
untouched. **Verified both ways**: widget server up → "1 post awaiting
moderation" renders; widget server killed → falls back to "Moderation widget
unavailable (is apps/admin running?)", feed posts still load, zero console
errors either way.

Gated behind a feature flag (`adminModerationWidget` in
`shared/config/flags.js`) — same mechanism topic 06 built for
`reactions`/`markdownComments`. That's not incidental: **"is this remote
available / should I even try" is exactly a feature flag's job**, whether the
risky thing is unshipped code or another team's runtime.

---

## The real dead end, and why it's worth keeping in these notes

The first attempt used `@originjs/vite-plugin-federation` — the closest thing
Vite has to webpack's Module Federation: a `remotes` config on the host, an
`exposes` config on the remote, a `shared: ['react']` singleton negotiation so
both apps run **one** copy of React. This is the more sophisticated design —
no bundled duplicate React, real dependency deduplication across
independently-deployed apps.

It broke in dev mode: `TypeError: e.forEach is not a function` inside the
plugin's generated `virtual:__federation__` runtime module, reproducible on a
clean install. Root cause, from reading the plugin's source and release
history: **the plugin's last meaningful release predates Vite's rolldown-based
build (`vite@8` here) by roughly two major versions**, and its runtime shim
assumes an internal shared-scope shape Vite no longer produces the same way.
Nothing in this repo's config was wrong — the tool is simply unmaintained
relative to the rest of this stack.

That's the actual lesson, not a footnote: **module federation for Vite is a
third-party plugin, not a platform feature** (unlike webpack, where it's
built in). Picking it means pinning to whatever Vite version it was last
verified against — a real, ongoing maintenance cost that "we're already on
the latest Vite" doesn't pay for free. The fallback that replaced it — bundle
your own React, expose `mount`/`unmount`, load via native `import()` — needed
no plugin, works on any bundler that can emit an ES module, and cost exactly
one `process.env.NODE_ENV` `define` (React's dev build checks it; library
mode doesn't set it automatically the way `vite build` does for an app).

**The trade this dead end makes concrete:** shared-singleton federation
(admin + devlog run *one* React) buys a smaller total payload and shared
component instances across the boundary, at the cost of a real, currently
fragile toolchain dependency. The bundle-your-own approach pays extra
kilobytes (devlog's page fetches a second copy of React, ~80KB gzipped in
this build) for zero coupling to a specific plugin's internals — a
maintainability-for-bytes trade that's often the right one for a boundary
this rare (one small widget), and the wrong one for a UI-heavy remote.

---

## Where this sits next to `packages/ui` (topic 11) and `packages/api-client` (topic 13)

Three ways this repo now shares code across apps, in increasing order of
independence:

| | `packages/ui` | `packages/api-client` | the widget (this topic) |
|---|---|---|---|
| shared at | **build time** — bundled into whatever imports it | build time | **runtime** — fetched as a URL |
| requires | same monorepo, `npm install` | same monorepo | nothing — could be a different repo, different team, different release cadence |
| a change ships when | the consuming app rebuilds | the consuming app rebuilds | **the *provider* redeploys** — devlog needs zero rebuild |
| React version | must match devlog's (peer dep) | n/a — no React in this package | **independent** — bundles its own |
| cost of the independence | none — it's still one repo | none | ~80KB duplicate React, an `ErrorBoundary` for "what if it's down", one more thing that can fail at runtime instead of build time |

The through-line: **every step toward independence (build-time package →
runtime-loaded widget) trades a compile-time guarantee for a runtime one.**
`packages/ui` breaking is a build failure devlog's CI catches before deploy.
The widget breaking is something a *user* could see, caught only by whatever
this topic just built — the `ErrorBoundary` fallback — which is why that
fallback isn't optional polish here, it's the load-bearing piece.

---

## What this topic deliberately doesn't build

- **Shared-singleton React across the boundary** — the federation attempt
  above was exactly this; the fallback bundles React twice on purpose. A
  correct from-scratch version of this needs either a working federation
  plugin or hand-rolled `importmap` + externalized `react`/`react-dom` served
  from one place both apps agree on — real, buildable, and a good "if you pick
  this up again" starting point.
- **Independent deploy pipelines** — both apps still build from one CI run in
  this repo (topic 14). A real micro-frontend split usually means separate
  repos or at least separate deploy triggers per app; nothing here prevents
  that, but nothing forces the point either — this topic proves the runtime
  *mechanism*, not the org/deploy structure around it.
- **A shell/registry pattern** (single-spa, a manifest of available
  micro-frontends devlog discovers instead of hardcoding a URL) — one widget
  doesn't earn that abstraction; three or four would.
- **Web Components as the boundary** — wrapping `mount`/`unmount` in a custom
  element (`<admin-pending-widget>`) would make the contract framework-agnostic
  in the DOM itself instead of a JS function pair. Same idea, more portable,
  not needed for one widget in an all-React repo.

## Next questions this raises

- What's the actual integration test story for a runtime boundary like this —
  Cypress/Playwright hitting both dev servers together? A build-time boundary
  gets caught by `depgraph:check`; this one currently has no automated check
  at all, only the manual verification in this file.
- If `packages/api-client`'s shape changes, nothing tells the widget or devlog
  they've drifted apart — unlike a workspace `"*"` dependency, there's no
  install-time signal. A contract test (or just: version the widget's fetch
  responses) is the honest next step before this pattern gets a second
  consumer.
- Cross-app **cross-cutting concerns** (topic 17, still queued from topic
  15's index) — if admin's widget needed devlog's current locale or theme,
  how does that cross a boundary this loose? Props on `mount()` is the
  obvious answer; whether that's enough is the topic 17 question.
