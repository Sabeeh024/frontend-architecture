# 11 — Extracting a shared UI package

Branch: `topic/11-shared-ui` (built on `topic/10-monorepo`).

```bash
git switch topic/11-shared-ui
npm install        # links node_modules/@repo/ui -> packages/ui (symlink)
npm run dev          # apps/devlog, styled exactly as before
npm run build         # packages/ui has no build script — turbo skips it, no error
```

## What moved, and the test used to decide

`Button`, `Spinner`, `Avatar`, `Async`, `ErrorBoundary` → `packages/ui`. The
test: **does it know anything about this app** — a store, the router, the i18n
catalog, a feature? If no, it's a design-system candidate. This is exactly
topic 02's presentational-component test ("props in, DOM out"), applied one
repo layer further out: a component that passed that test *inside* an app is
now provably reusable *across* apps, because nothing had to change to move it.

## The interesting call: splitting `Toaster`

`Toaster` didn't move whole — it *couldn't*, it reads `toastStore` directly.
Split in two:

```jsx
// packages/ui/src/ToastList.jsx — pure, ships in the package
export function ToastList({ toasts, onDismiss }) {
  return <div className="toaster">{toasts.map(t => …)}</div>
}

// apps/devlog/src/shared/ui/Toaster.jsx — app-owned, stays put
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return <ToastList toasts={toasts} onDismiss={dismiss} />
}
```

This is the topic-02 headless/presentational split, but now the *boundary
between the two halves is the package boundary itself*: the design system
ships the look, the app supplies the data. Any future app reuses `ToastList`
with its own store, its own notification source — the package never needs to
know Zustand exists.

## What stayed, deliberately: `RequestMeter`

Devlog's dev-only request counter reads `shared/api/client`'s `requestLog` —
that's the app's own mock backend, not a general concern. Nothing here is
"too small to extract" or "too app-specific to extract" by rule of thumb;
it's the same store/router/catalog test as above, and `RequestMeter` fails it
on purpose. Not every component belongs in the design system.

## Mechanics: how the package gets consumed

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "main": "./src/index.js",
  "peerDependencies": { "react": "^19.0.0" }
}
```

```json
// apps/devlog/package.json
{ "dependencies": { "@repo/ui": "*" } }
```

`npm install` at the workspace root sees `@repo/ui` matches a local
workspace package and symlinks it: `node_modules/@repo/ui -> packages/ui`.
No registry involved, no version to bump yet (that's topic 15).

**Ships as source, not a build.** `main` points straight at `./src/index.js`
— raw JSX, untranspiled. `apps/devlog`'s own Vite instance processes it
exactly like a first-party file the moment it resolves the symlink; zero Vite
config changes were needed, and the dev server hot-reloads package edits the
same as app edits. The alternative — give `packages/ui` its own build step
(tsup/Rollup) that outputs compiled JS + a `dist/`, and point `main` there —
buys isolation (the app can't accidentally depend on the package's internal
file layout) and is closer to what you'd need before publishing to a real
registry, at the cost of a build step between "I edited a component" and "the
app sees it." Source-only is the right default for an internal, workspace-only
package; revisit when topic 15 asks "does this get published anywhere real?"

**`peerDependencies`, not `dependencies`, for React.** The package doesn't
ship its own copy of React — it declares "whatever app uses me must provide
one." Two copies of React in one page breaks hooks; peer deps plus one
resolved copy (npm workspaces hoist it to the root `node_modules`) is how a
shared UI package avoids that without extra config.

## Verified

- Full build: 133 modules, the package resolves through the workspace
  symlink and its JSX transforms with the app's existing Vite config — no
  changes needed.
- `npm run build`/`lint`/`test` from the root: turbo now shows "2 packages in
  scope"; `@repo/ui` participates in `lint` (it has a script) and is silently
  skipped for `build`/`test` (it has no script for either) — no error, no
  special-casing needed in `turbo.json`.
- All 22 tests still pass; dependency-cruiser still reports zero violations
  (62 modules) — importing from `node_modules` doesn't trip any `src/`-scoped
  boundary rule from topic 07.
- Browser-verified end to end: themed `Button`/`Spinner`/`Avatar` render
  correctly (the app's CSS still styles them — see below); logged in, opened
  a post, posted a comment — optimistic update, pluralized count, and the
  `ToastList`-rendered toast all worked exactly as before the extraction.

## Two gaps, named on purpose (`packages/ui/README.md`)

- **No build/publish story yet.** Fine inside one workspace; the moment this
  needs to leave the monorepo (a different repo, a different company) it
  needs versioning, a changelog, and a real build — topic 15.
- **No shared CSS.** The package emits class names (`btn`, `spinner`, …) but
  ships no styles — `apps/devlog/src/styles/app.css` still defines the look.
  A second app (topic 12) would render *unstyled* `Button`s unless it either
  imports Devlog's CSS (wrong direction) or the design tokens/base styles
  move into the package too. Left as a named gap rather than guessed at
  before there's a second consumer to design it against — consistent with
  this whole exploration's "promote to shared only when a second consumer
  needs it" rule (topics 01 and 07).

## Next questions this raises

- Topic 12 (a second app) will immediately hit the CSS gap above — that's
  probably where it gets solved, once there's a real second consumer to
  design the answer against instead of guessing.
- Storybook (or similar) as the package's actual documentation + visual
  contract, instead of the hand-written table in `packages/ui/README.md`.
- Visual regression testing — nothing currently catches "the package changed
  and an app's screenshot changed with it."
- Should `packages/ui` get its own `boundaries`-style lint config (nothing
  stops a future component in here from importing a hook that reaches back
  into `apps/devlog`)? Topic 07's rules are still scoped to one app's `src/`.
