# 12 — A second app

Branch: `topic/12-second-app` (built on `topic/11-shared-ui`).

```bash
git switch topic/12-second-app
npm run build         # builds @repo/ui, admin, devlog in one command
cd apps/admin && npm run dev   # Devlog Admin — dark mode, no CSS written for it
```

## Why a second app, now

Topic 11 extracted `packages/ui` but only ever had one consumer — every claim
about "reusable" was unverified. A second app is the only way to find out
what's actually shared vs. what silently only worked because there was one
of it. This topic builds **Devlog Admin**: a one-screen post-moderation
dashboard (list posts, toggle "featured", see a toast) — small on purpose,
real enough to exercise every exported component.

## The real work: `packages/ui/src/styles.css`

Topic 11 named "no shared CSS" as a gap and deliberately didn't solve it —
guessing at a styling contract with one consumer is just guessing. Building
Admin forced the actual answer:

```
apps/devlog/src/styles/app.css     packages/ui/src/styles.css        apps/admin/src/styles.css
(layout only, 32 lines)       <-   (tokens + base + component CSS)   ->  (layout only, 12 lines)
                                    exposed as "./styles.css" in
                                    the package's exports map
```

Every app now does the same thing:

```css
@import '@repo/ui/styles.css';
/* + only this app's own layout classes */
```

What moved into the package: the design tokens (`--bg`, `--fg`, `--accent`,
`--muted`, `--border`, including the dark-mode variants), the base reset
(`box-sizing`, `body`, link colors), and the CSS for every exported component
(`.btn`, `.spinner`, `.avatar`, `.toaster`/`.toast`). What stayed in each
app: layout (`.admin`, `.post-rows`, `.badge` for Admin; `.topbar`,
`.comments`, `.settings .subnav` for Devlog) — nothing about those is
shareable, they're specific to what each app actually shows.

**Verified two ways.** Devlog first, as a regression check: same
screenshot, pixel-identical, before and after the CSS split — the tokens and
component styles didn't change, only which file declares them. Then Admin,
as the actual proof: a `<Button>`/`<Avatar>` dropped into a brand-new app
with zero component CSS written for it, correctly themed **including dark
mode**, because the token contract lives in one place both apps import.

## What Admin *doesn't* share with Devlog — on purpose

- **Its own fake data** (`apps/admin/src/data.js`) — a second, unrelated list
  of posts. Two apps each hand-rolling "a list of posts with an id/title/
  author" is exactly the duplication topic 13 (shared logic beyond UI) exists
  to remove. Leaving it duplicated here, rather than reaching for a shared
  package prematurely, is what makes that gap concrete instead of assumed —
  same "promote to shared only when a second consumer needs it" rule as
  topics 01 and 07, now visible at the data layer.
- **No React Query.** Admin's `usePosts` is a dozen hand-rolled lines
  (`useState` + `useEffect`, topic 02/03's original `useAsync` shape) instead
  of the cache Devlog needed. Admin is one screen reading one list once —
  React Query's whole value (shared cache across screens, background
  refetch, invalidation) has nothing to attach to yet. **A second app doesn't
  have to repeat every architectural decision the first one made** — only
  the ones that actually solve a problem it has.
- **No store for its toasts.** Devlog's `Toaster` reads `toastStore`
  (Zustand); Admin's toast list is a plain `useState` array, and both render
  through the exact same `<ToastList toasts={} onDismiss={}/>` from the
  package. This is topic 11's split paying off precisely as designed:
  `ToastList` never knew or cared which state mechanism was behind it.

## Verified

- `npm run {build,lint,test,depgraph:check}` from the root now span **three**
  workspaces (`@repo/ui`, `admin`, `devlog`) automatically — nothing in
  `turbo.json`, `package.json`'s scripts, or `.github/workflows/ci.yml`
  changed. `apps/*` in the workspace glob already meant "every app"; adding
  one was just adding a folder.
- A repeat `npm run build`: **both apps cache-hit, 27ms, "FULL TURBO."**
  Turbo's cache isn't per-task-in-one-package, it's per-package-per-task —
  unrelated apps sharing a build don't invalidate each other.
- Lint: 3 packages, 0 errors. Test/depgraph:check: only `devlog` has those
  scripts, so only it runs — Admin is silently skipped, no config needed to
  make that graceful.
- Browser-tested Admin's actual flow: click "Feature" on a post → status
  badge flips, button label flips, a toast slides in ("On layered
  architecture is now featured") styled identically to Devlog's — same
  green-left-border success style, same position, same font — entirely from
  shared CSS and the shared `ToastList`, wired to nothing Devlog uses.

## Next questions this raises

- The data duplication named above is deliberately unresolved — topic 13.
- Two apps' `package.json`s now hand-list nearly the same devDependencies
  (`vite`, `@vitejs/plugin-react`, `oxlint`) and Admin has no `eslint.config.js`
  / boundaries rules at all. Worth a shared `packages/config` (base
  `eslint.config.js`, `vite.config.js` presets) once a third consumer makes
  the copy-paste actually hurt — same threshold as everything else in this
  phase.
- `packages/ui`'s CSS is one file, `@import`ed whole. At what point does a
  design system need per-component CSS files (so an app can tree-shake
  unused component styles) instead of one shared stylesheet?
- Nothing stops Admin from importing a Devlog-internal file directly (there's
  no cross-*app* boundary rule, only the topic-07 rules scoped inside each
  app's own `src/`) — flagged in topic 10 too, still open.
