# 07 — Dependency rules & enforcement

Branch: `topic/07-boundaries` (built on `topic/06-cross-cutting`).

```bash
git switch topic/07-boundaries
npm run lint          # oxlint (correctness) then eslint (architecture)
npm run depgraph:check # whole-graph rule check
npm run depgraph       # regenerate docs/dependency-graph.mmd
```

## The gap every previous topic left

Topics 01–06 kept stating rules — "shared imports nothing domain-specific",
"features go through `index.js`", "one-way, no cycles" — and then relying on
**everyone remembering them**. That holds for one person for a week. It does not
survive a second contributor, a refactor, or a Friday afternoon.

The rules, restated as something a machine checks:

```
app     ─→ feature, shared          (composition root, imports anything below)
feature ─→ feature, shared          (one-way; cycles forbidden)
shared  ─→ shared                   (zero domain knowledge — stays reusable)
into a feature: only its index.js / queries.js / *Page / *Layout
cycles: none, anywhere
```

Two tools enforce this, with **different blind spots** — run both.

---

## Tool 1 — ESLint (per-file, in-editor, on the PR)

`eslint.config.js`, three rules:

| rule | plugin | catches |
|---|---|---|
| `boundaries/dependencies` | `eslint-plugin-boundaries` | wrong-direction imports (shared→feature, feature→app) |
| `boundaries/entry-point` | same | deep-importing past a feature's public entry |
| `import-x/no-cycle` | `eslint-plugin-import-x` | any import cycle |

`boundaries` works by **classifying every file** into an element by path:

```js
'boundaries/elements': [
  { type: 'app',     pattern: 'src/app/**' },
  { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
  { type: 'shared',  pattern: 'src/shared/**' },
]
```

then `policies` say which element may import which:

```js
'boundaries/dependencies': ['error', { default: 'disallow', policies: [
  { from: { element: { type: 'app' } },
    allow: { to: { element: { types: { anyOf: ['app','feature','shared'] } } } } },
  { from: { element: { type: 'feature' } },
    allow: { to: { element: { types: { anyOf: ['feature','shared'] } } } } },
  { from: { element: { type: 'shared' } },
    allow: { to: { element: { type: 'shared' } } } },
]}]
```

### Seen working — three deliberate violations

| planted | rule that fired | message |
|---|---|---|
| `shared/lib/formatDate.js` imports `features/auth` | `boundaries/dependencies` | *no policy allowing shared → feature "auth"* |
| `comments/ui/Comments.jsx` imports `../../auth/useAuth` (not `../../auth`) | `boundaries/entry-point` | *`useAuth.js` is not an entry point of "auth"* |
| `shared/lib/analytics.js` imports `app/queryClient` | `import-x/no-cycle` **and** `boundaries/dependencies` | *Dependency cycle detected* |

### The entry-point / barrel rule, and the topic-05 tension

`boundaries/entry-point` lets a feature be imported only through named files:

```js
{ target: ['feature'], allow: ['index.js', 'queries.js', '*Page.jsx', '*Layout.jsx'] }
```

- `index.js` — the feature's programmatic API (`useAuth`, `AuthProvider`, …)
- `queries.js` — the loader↔hook contract from topic 05
- `*Page.jsx` / `*Layout.jsx` — **route entries**. Topic 05 deliberately kept
  these out of the barrel so the router can `lazy` them into their own chunks.
  So the enforced public surface is *barrel + route entries*, and this rule is
  where that decision gets written down.

> The `boundaries` plugin is mid-migration (v7): `entry-point` prints a
> deprecation notice pointing at `dependencies` + a `fileInternalPath` selector.
> It still works; the warning is noise, not failure. Real projects live with
> this kind of churn — it's a cost of the enforcement, weighed against the bugs
> it stops.

---

## Tool 2 — dependency-cruiser (whole-graph, CI, a picture)

`.dependency-cruiser.cjs` re-states the same rules as `forbidden` patterns and
walks the **entire** import graph at once:

```js
{ name: 'shared-stays-generic', severity: 'error',
  from: { path: '^src/shared/' }, to: { path: '^src/(features|app)/' } },
{ name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
{ name: 'no-orphans', severity: 'warn', from: { orphan: true, … }, to: {} },
```

`npm run depgraph` writes `docs/dependency-graph.mmd` (a Mermaid diagram of
every module and edge).

### It caught what ESLint missed

First `depcruise` run, on a tree ESLint called clean:

```
error features-dont-import-app:
  src/features/settings/ProfilePage.jsx → src/app/theme/ThemeProvider.jsx
```

**Why ESLint missed it:** my first `boundaries/elements` pattern was
`src/app/*` — direct children only. `app/theme/ThemeProvider.jsx` is one level
deeper, so `boundaries` never classified it as `app`, so no rule applied.
`depcruise` matched on the regex `^src/app/` and saw it immediately.

Fix was two parts:
1. `boundaries` pattern → `src/app/**` (classify nested files too).
2. The actual leak: **`ThemeProvider` moved `app/theme/` → `shared/theme/`.**
   A feature consumes the theme now, so by topic 01's "promote to shared when a
   second consumer appears" rule it's shared infrastructure. `app/providers.jsx`
   still *wires* the provider; the mechanism lives in `shared/`.

Lesson: **per-file linting and whole-graph analysis have different holes. In CI,
run both.**

---

## The bigger point

The layered-vs-feature choice from topic 01 applies to the **rules** too:

- ESLint config = one central file describing the whole policy (layer-based).
- Each feature could instead carry its own `.eslintrc` overrides (feature-based).

Central wins here — the policy *is* global, and one file is the honest place
for it. Same reasoning as putting the route tree in one `router.jsx`.

And the division of labour in `npm run lint`:

| tool | job |
|---|---|
| **oxlint** | fast, every save — correctness, rules-of-hooks, unused vars |
| **eslint** | architecture — boundaries, cycles (slower, fewer rules) |
| **dependency-cruiser** | CI gate + the diagram |

---

## The inside-the-app arc, complete

```
01 structure     feature-based folders
02 composition   headless hooks · presentational · one compound
03 data          React Query cache — keyed, shared, deduped
04 state         useState / Context (theme→shared, auth) / store (toasts, auth)
05 routing       data router — routes own layout, data, code, errors
06 cross-cutting store/module for anything non-React reads · layered errors ·
                 flags · optimistic updates · analytics attach points
07 enforcement   ESLint boundaries + dependency-cruiser make the rules real
```

The dependency graph is now **acyclic, one-directional, and checked** — the
precondition for everything "outside the app": splitting a feature into its own
package, a design-system library, or a micro-frontend all assume the seams are
already clean.

## Next questions this raises

- CI: none of this runs automatically yet — a GitHub Action running
  `lint` + `depgraph:check` + `build` on every PR is the missing piece.
- The `boundaries` v7 `fileInternalPath` migration — worth doing to kill the
  deprecation noise, or wait for the API to settle?
- Testing was flagged in topic 05 and never done: `createMemoryRouter` for
  route/loader tests, RTL for components, mocking the fake api.
- Everything so far is one app in one repo. → **outside the app**: when does a
  feature become a package, a repo, a separately-deployed micro-frontend, and
  what breaks at each step.
