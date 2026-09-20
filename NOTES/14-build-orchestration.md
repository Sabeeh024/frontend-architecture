# 14 — Build orchestration at scale

Branch: `topic/14-build-orchestration` (built on `topic/13-shared-logic`).

```bash
git switch topic/14-build-orchestration
npx turbo run build --filter='...[HEAD^1]' --dry=json   # see exactly what a diff affects
```

## Why this, now

Four packages already benefit from turbo's cache (topics 10–13 kept showing
"FULL TURBO" on repeat runs). At real scale — dozens of packages, a CI runner
that isn't the machine that warmed the cache — two more problems show up:

1. **A cache hit still costs something.** Restoring and verifying a hit for a
   package nothing in this PR could have touched is waste, just smaller waste
   than a rebuild.
2. **The cache can be *wrong*, not just cold**, if something that affects
   every package's output (a lockfile bump, a shared `tsconfig`) isn't
   declared as an input turbo hashes.

This topic covers both: computing the actually-affected subset of the
workspace from a git diff, and telling turbo about the inputs that aren't
scoped to any one package.

## Affected-only: `--filter=...[<ref>]`

`turbo run build --filter='...[HEAD^1]'` means "every package with changes
since `HEAD^1`, plus everything that depends on them" (the `...` prefix walks
forward through the dependency graph). Two real diffs, `--dry=json` reporting
exactly what's in scope:

| change | packages affected |
|---|---|
| a comment added only in `apps/admin/src/usePosts.js` | `["admin"]` — `devlog` doesn't appear in the task graph at all, not even as a cache hit |
| a comment added only in `packages/ui/src/Button.jsx` | `["@repo/ui", "admin", "devlog"]` — every dependent, correctly, `@repo/api-client` excluded since nothing about it changed |

The second row is the part that matters: turbo didn't need telling that
`admin` and `devlog` both depend on `@repo/ui` — that's already in each
`package.json`, and turbo builds the affected set from the same dependency
graph `dependsOn: ["^build"]` (topic 10) already walks.

## `globalDependencies` — inputs no single package owns

```json
// turbo.json
{ "globalDependencies": ["package-lock.json"], "tasks": { … } }
```

Without this, turbo hashes each task's own package's files — a dependency
version bump in the root lockfile touches every `node_modules`, but isn't
inside any one package's folder, so nothing would invalidate. `--dry`
confirms it's tracked: `Global Files = 1` (was `0` before this line existed).
Any file listed here changing busts **every** package's cache on the next
run — deliberately blunt, because "did a shared dependency change" is exactly
the kind of thing that should force everyone to rebuild rather than risk a
stale cache silently shipping.

## Wiring CI to use it

```yaml
# .github/workflows/ci.yml
- uses: actions/checkout@v4
  with: { fetch-depth: 0 }   # turbo needs real history to diff against

- run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      echo "filter=--filter=...[origin/${{ github.base_ref }}]" >> "$GITHUB_OUTPUT"
    fi
  id: turbo

- run: npm run lint -- ${{ steps.turbo.outputs.filter }}
- run: npm run build -- ${{ steps.turbo.outputs.filter }}
# (test, depgraph:check the same way)
```

A PR only lints/tests/builds what its diff could have broken; a direct push
to the default branch has no "before" to trust, so the filter is empty and
every command falls back to the full run it always did. **Verified the
mechanism locally** — `npm run lint -- --filter=...[HEAD^1]` passes the flag
through to `turbo run lint` exactly as CI will invoke it (confirmed against
both diffs above). The GitHub Actions YAML itself is unexercised — there's no
real PR to trigger it against from here — but the command it runs is the
same one just proven to work.

## What's still described, not built: remote caching

Everything above is turbo's **local** cache — one machine, one `.turbo/`
folder. **Remote caching** uploads the same content-addressed cache entries
to a shared store (Vercel's hosted Remote Cache, or a self-hosted server
implementing the same API) so a CI runner that has *never* built this repo
before can still cache-hit, because a teammate's laptop or an earlier CI run
already produced that exact hash. That's the payoff that actually matters at
team scale — local caching only helps the one machine that keeps rebuilding
the same thing.

Not wired up here: it needs an external service and credentials (a Vercel
token, or standing up and hosting a remote-cache server) — the same category
of gap as SSR in topic 09 or the shared mock server in topic 13. The
mechanism this topic *did* build (affected-only filtering, correct
invalidation) is what remote caching would sit underneath; adding it later
is a config change (`TURBO_TOKEN`/`TURBO_TEAM` env vars), not a re-architecture.

## Next questions this raises

- `turbo prune` — generates a pruned monorepo subset (one app + only the
  packages it actually depends on) for a Docker build context. Relevant the
  moment topic 16 (micro-frontends) or any real deployment needs an image
  that isn't "the whole workspace."
- At dozens of packages, does the flat `apps/*` + `packages/*` glob still
  say enough, or does `turbo.json`'s task graph need explicit `dependsOn`
  edges beyond package-manager dependencies (e.g. "run this app's e2e tests
  after that other app's build," with no `package.json` dependency between
  them)?
- Remote caching, once there's a real team/CI account to wire it to.
