# 10 — Monorepo fundamentals

Branch: `topic/10-monorepo` (built on `topic/09-i18n`). First topic of the
"outside the app" phase.

```bash
git switch topic/10-monorepo
npm install        # one install, every workspace
npm run dev          # -> turbo run dev  -> apps/devlog's dev server
npm run build         # try it twice — second run is instant (cached)
```

## Why this, before anything else "outside"

Every later topic in this phase — a shared design-system package, a second
app, independent deploys, micro-frontends — needs somewhere to put more than
one deployable thing. A monorepo is the least disruptive way to get there:
one repo, multiple `package.json`s, shared tooling, and (critically) **atomic
commits across app + shared-package boundaries** — change a shared component
and the app that uses it in the same commit, same PR, same CI run. The
alternative (separate repos per package from day one) defers that problem to
a publish-and-bump cycle before you've even proven the split is right.

## What changed, mechanically

```
before                          after
frontend-architecture/          frontend-architecture/
  src/                            apps/
  index.html                        devlog/
  vite.config.js                      src/            <- byte-identical
  package.json (owns everything)      index.html         to before, just
                                       vite.config.js     git mv'd
                                       package.json    <- now owns the deps
                                                           + the real scripts
                                  package.json         <- now the workspace
                                  turbo.json               root
```

`git mv` for every file kept history intact (`git log --follow` on any moved
file still shows topics 01–09). The app's code is **completely unchanged** —
same imports, same relative paths, same tests. Only two things had to move:
its `package.json` (deps + scripts) and its tool configs (`vite.config.js`,
`eslint.config.js`, `.dependency-cruiser.cjs`) — all of which already worked
relative to the app's own root, so they didn't need edits, just relocation.

## The two tooling choices

**Package manager: kept npm (workspaces), didn't switch to pnpm/yarn.**
npm's `workspaces` field is enough for what this repo needs: one lockfile,
shared install, symlinked cross-package deps once `packages/` exists.
pnpm's workspace is generally faster and stricter about phantom dependencies
(it won't let a package silently resolve something it didn't declare) — a
real advantage at scale, but not worth a package-manager migration for a
teaching repo already on npm. **Yarn PnP** goes further still (no
`node_modules` at all) at the cost of tooling compatibility friction. Pick
npm/pnpm/yarn workspaces almost interchangeably at this size; the difference
shows up in install speed and strictness once there are dozens of packages.

**Task runner: Turborepo, not Nx (or nothing).**

| | plain npm scripts | **Turborepo** | Nx |
|---|---|---|---|
| runs a script in every workspace | `npm run <s> --workspaces` (no caching, no parallelism smarts) | `turbo run <s>` | `nx run-many` |
| caching (skip work that hasn't changed) | none | ✅ local + optional remote | ✅, more granular |
| "affected only" (topic 14) | none | ✅ via git diff | ✅, plus a full project graph |
| code generators, plugins, project graph visualizer | none | minimal | extensive |
| config | one `turbo.json` | — | `nx.json` + per-project config, steeper |

Turborepo was picked because it's the smaller commitment: one config file,
works with the package manager already in place, and its entire value
proposition — **run a task across every workspace, skip what's cached** — is
exactly what this repo needs right now. Nx's generators and deep project
graph earn their complexity at a scale (many teams, many packages, custom
scaffolding needs) this repo isn't at. Re-evaluate if that changes.

## `turbo.json` — the pipeline

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": {},
    "depgraph:check": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

`dependsOn: ["^build"]` means "build this package's dependencies first" — a
no-op today (one app, no `packages/`) but load-bearing the moment topic 11
adds `packages/ui`: `devlog` will depend on it, and turbo will build the
package before the app that imports it, automatically, from the dependency
graph in `package.json` — no manual ordering. `dev` is marked `persistent`
(it doesn't exit) and `cache: false` (there's nothing to cache about a
long-running process).

**Caching, demonstrated:** first `npm run build` — cold, ~1.8s. Run it again
with nothing changed:

```
Cached:    1 cached, 1 total
Time:      22ms >>> FULL TURBO
```

Turbo hashes the task's inputs (source files, the task's own config, its
dependencies' outputs) and skips re-running when the hash matches a previous
run. This is the same instinct as topic 03's React Query cache and topic 05's
`staleTime: 'static'` — don't redo work whose inputs haven't changed — applied
to the build system instead of the network.

## The pleasant surprise: CI needed zero changes

`.github/workflows/ci.yml` still just runs `npm run lint`, `npm test`,
`npm run build` from the repo root. Those script *names* didn't move even
though what they do (now: fan out through turbo to every app) completely
changed. That's the actual lesson: **keep the root-level script vocabulary
stable** (`dev`/`build`/`lint`/`test`/…) and every app can be restructured,
split, or multiplied behind it without CI, editor tasks, or a new
contributor's muscle memory needing to know or care. The same idea as a
feature's `index.js` barrel (topic 01) or a route's public shape (topic 05) —
a stable interface over changeable internals — just one layer higher, at the
repo's own command surface.

## What this doesn't fix — the cost side

- **One `git log`, every app's history interleaved.** `git log --follow
  apps/devlog/...` scopes it back down, but `git blame` across the whole repo
  is noisier than a dedicated repo would be.
- **Nothing stops `apps/devlog` from importing another future app's internals** —
  topic 07's `boundaries` rules are still scoped to one app's `src/`; a
  monorepo-wide boundary rule (app→app forbidden, only through `packages/`)
  is real future work once there's a second app to violate it.
- **A monorepo can hide coupling that should've been an API.** Two apps
  sharing a package is fine; two apps reaching into each other's `src/`
  because the folder happens to be three levels up is exactly the kind of
  quiet dependency this phase's whole point is to make explicit and paid-for
  (a version bump, a published contract) instead of free.
- **CI still runs everything, every time**, cache aside — "affected only" test
  selection (only run what a PR's diff could have broken) is topic 14, not
  yet built.

## Next questions this raises

- `packages/` is declared in the workspace glob but doesn't exist yet — topic
  11 extracts `shared/ui` into a real package and makes `dependsOn: ["^build"]`
  mean something.
- Once there's a second app, do the topic-07 boundary rules need a
  monorepo-wide version, or does each app keep its own independent config?
- Remote caching (Vercel's or a self-hosted one) turns "instant on my machine"
  into "instant in CI too" — worth it once the team, not just one laptop, is
  waiting on builds.
