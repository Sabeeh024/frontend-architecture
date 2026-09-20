# 15 — Versioning & release

Branch: `topic/15-versioning` (built on `topic/14-build-orchestration`).

```bash
git switch topic/15-versioning
cat packages/ui/CHANGELOG.md   # generated, not hand-written
npx changeset status            # shows what's pending, if anything
```

## The problem this closes

`@repo/ui` and `@repo/api-client` have been sitting at `"version": "0.0.0"`
since topics 11 and 13 — every change, breaking or not, invisible to anyone
reading `package.json`. No changelog, no way to answer "what changed in this
package since last week" without reading every commit that touched it.

## Independent versioning, and why

Two strategies most tools support:

- **Fixed/linked** — every package in the group bumps together, one version
  number for the whole set (how a framework with tightly-coupled packages,
  e.g. Babel's `@babel/*`, often does it).
- **Independent** — each package has its own version, bumped only when *it*
  changes.

`.changeset/config.json` here uses independent (`"fixed": []`, `"linked":
[]`): `@repo/ui` (a design system, changes when a component changes) and
`@repo/api-client` (a data layer, changes when an endpoint changes) have no
reason to move in lockstep. Fixed versioning is for packages that are
conceptually one release even if split into files — not the case here.

## Why Changesets over the alternatives

| approach | how it decides the version bump | fits here? |
|---|---|---|
| manual (`npm version` by hand) | a human remembers, on every change | no discipline, no changelog, what topics 11-13 already had |
| **Changesets** ← used | a markdown file per change, written *with* the PR that makes it, naming the package + bump type + a human summary | matches this whole exploration's pattern: the artifact describing a change ships in the same commit as the change |
| semantic-release | parses commit messages (Conventional Commits) to infer the bump | needs commit-message discipline enforced separately; better fit for a single package/repo than a multi-package workspace with independent versions |
| Lerna's own versioning | historically similar to Changesets; most of the ecosystem (including Lerna itself) now delegates to Changesets under the hood | would just be this, one layer removed |

Changesets won because the changeset file *is* the changelog entry, written
by whoever made the change, at the moment they understand it best — not
reconstructed later from commit messages or a release manager's memory.

## The real flow, demonstrated

Added a genuine, small, backwards-compatible change: a `size` prop on
`Button` (`sm`/`md`/`lg`, default `md`) — every existing call site keeps
rendering identically. The changeset describing it:

```md
---
"@repo/ui": minor
---

Add a `size` prop to `Button` (`sm` | `md` | `lg`, default `md`). Additive
and backwards-compatible — every existing `<Button>` call site keeps
rendering exactly as before.
```

> Hand-written here — the interactive `npx changeset` prompt (pick packages,
> pick bump type, write a summary) doesn't run in a non-interactive shell.
> The file it would have produced is exactly this shape; typing it by hand
> changes nothing about what Changesets does with it.

`npx changeset version` then:

```
packages/ui:   0.0.0 -> 0.1.0
packages/ui/CHANGELOG.md:  created, with the changeset's own words
apps/devlog, apps/admin:   untouched — listed in config.json's "ignore"
.changeset/lucky-buses-smile.md:  deleted — consumed
```

**Apps are `ignore`d on purpose.** `devlog` and `admin` are deployable, not
published — semver has no meaning for something that redeploys on every
merge rather than getting installed at a pinned version. Only the two
packages that other things actually *depend on* participate.

## The nuance worth being honest about: `"*"` means the version is inert, today

`apps/devlog`'s `package.json` still says `"@repo/ui": "*"` — a wildcard that
resolves to "whatever's in the workspace," ignoring semver entirely. Bumping
`0.0.0` → `0.1.0` changed **nothing** about what either app actually
resolves or runs; that was already proven by the full test suite staying
green and the browser check showing an identical render. The version number
and changelog are pure **documentation and discipline** right now — valuable
for a human deciding whether it's safe to read a diff before depending on a
change, worthless to npm's resolver as configured. It becomes load-bearing
the moment either package (a) gets consumed by something that pins a real
range instead of `*`, or (b) is published somewhere `*` can't reach at all
(a separate repo, an external team). Versioning ahead of that need is still
worth it — the discipline and the changelog habit are what's hard to
retrofit later, not the version number itself.

## A version pin, hit for real: `@changesets/cli@3` vs `2`

Installed `^3.0.3` first (latest at time of writing). `changeset status`
silently reported nothing pending; `changeset version` claimed success
("All files have been updated") and touched nothing. Digging into
`@changesets/assemble-release-plan` directly surfaced the actual failure —
`TypeError: Cannot read properties of undefined (reading 'version')` — with
the CLI itself never surfacing it. Pinned to `2.31.1`, the long-stable major
version nearly every guide and tutorial documents; it worked correctly on
the first try. Filed here as the same category of lesson as TanStack
Query's `ensureQueryData` deprecation (topic 05) and React Router's data
router needing happy-dom over jsdom (topic 08): **verify the tool actually
did what it claimed** — a silent no-op is worse than a loud error, and
"latest" isn't always the version that works.

## `.github/workflows/release.yml` — described and scaffolded, publish unexercised

The standard `changesets/action`: every push to `master` checks for
unconsumed changesets and opens (or updates) a "Version Packages" PR running
`changeset version` for you; merging *that* PR is what would trigger
`changeset publish`. Added, but **the publish half never runs here on
purpose** — `@repo/ui` and `@repo/api-client` are `"private": true` (topic
11's deliberate choice), so `npm publish` refuses them even with a valid
`NPM_TOKEN`, which this repo doesn't have configured anyway. Same honesty
pattern as SSR (topic 09) and remote caching (topic 14): the workflow is
what takes over the day a package needs to leave this monorepo; nothing
about the versioning/changelog mechanics this topic actually built requires
it to run.

## Verified

Full `build`/`lint`/`test`/`depgraph:check` clean after the version bump —
mostly cache hits ("FULL TURBO"), because a `package.json` version bump and
a new `CHANGELOG.md` don't touch any source turbo's build task actually
hashes. Browser-smoke-tested Devlog: `Button` renders pixel-identical
(`size` defaults to `'md'`, same padding as before) — the changeset's own
claim of "backwards-compatible" held up under an actual look, not just a
green test suite.

## Next questions this raises

- Nothing in CI currently *requires* a changeset on a PR that touches
  `packages/*` — the common pattern is a "changeset bot" check that fails
  the PR if `packages/` changed with no `.changeset/*.md` added. Cheap,
  would close the "someone forgets" gap the same way topic 07's lint rules
  closed "someone forgets the import direction."
- If `@repo/ui` ever does get published, where — public npm (`@repo` would
  need to be a real, owned npm org scope), GitHub Packages, or a private
  registry? Each changes `.changeset/config.json`'s `access` and the
  publish command's auth.
- `updateInternalDependencies: "patch"` (in `config.json`) matters the
  moment one *package* depends on another package in the same repo (e.g. if
  `@repo/ui` ever imported something from `@repo/api-client`) — untested
  here since neither package currently depends on the other.
