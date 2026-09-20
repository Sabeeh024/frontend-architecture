# Frontend architecture

Each topic explored by actually building it — on Devlog (a tiny feed/post/
comments app with a mock in-memory API) for topics 01–09, on the repo itself
from topic 10 on — on its own branch, chained onto the one before it, then
written up here. `master` holds only these notes and the pristine scaffold.

## Part 1 — inside the app (01–09)

| # | topic | branch | the one-line takeaway |
|---|---|---|---|
| 01 | [Folder structure](01-folder-structure.md) | `structure/feature-based` (+ `layered`, `fsd`) | Feature-based over layer-based; Feature-Sliced Design is the same idea formalized — worth it at scale, ceremony below it |
| 02 | [Component composition](02-component-composition.md) | `topic/02-composition` | Headless hook by default; presentational components when rendering repeats; compound components for a fixed part-set with free layout |
| 03 | [Data fetching](03-data-fetching.md) | `topic/03-data-fetching` | Server data isn't state you own — it's a cache of the server's. React Query over hand-rolled fetch hooks |
| 04 | [State management](04-state-management.md) | `topic/04-state` | `useState` → lift → Context (read-often/changes-rarely) → store (changes often / needed outside React) |
| 05 | [Routing as architecture](05-routing.md) | `topic/05-routing` | A route = URL + layout + data + code-split + error handling, declared in one place, not scattered across components |
| 06 | [Cross-cutting concerns](06-cross-cutting.md) | `topic/06-cross-cutting` | If non-React code needs it (a loader, a callback), it can't live in Context — push it to a store or plain module |
| 07 | [Dependency rules & enforcement](07-boundaries.md) | `topic/07-boundaries` | Rules you only wrote down aren't rules. ESLint boundaries + dependency-cruiser make them real; the two tools have different blind spots — run both |
| 08 | [Testing + CI](08-testing.md) | `topic/08-testing` | Testability is a property of the boundaries — one test file per layer proves (or breaks) the claims topics 01–07 made |
| 09 | [Internationalization](09-i18n.md) | `topic/09-i18n` | Same store-vs-Context split as topic 06, applied again; of everything "production i18n" adds, URL-based locale routing is the one that's architecture, not a library swap |

## The through-line

Every topic reduces to the same handful of questions, asked at a different
layer each time:

- **Where does this live?** (folder / component / store vs. Context / route vs.
  component / catalog module) — and does it need to be reachable by non-React
  code (a loader, a plain function)?
- **What's the boundary, and is it enforced or just agreed?** (topics 01 and 07
  are the same question, one before tooling existed to check it, one after)
- **What does promoting something cost, and when is it worth it?** (FSD's
  re-gluing tax, optimistic updates' rollback complexity, i18n's URL refactor)

By topic 09 the app has: a feature-based structure with enforced boundaries
(lint + whole-graph CI check), a React Query cache doing most of the "shared
state" work, three flavors of client state each used where they fit, routing
that owns data/code/errors for its screen, cross-cutting concerns sorted into
Context vs. store vs. module by one clear rule, a test per architectural
layer, and locale as a first-class routing concern. That's the acyclic,
one-directional, checked dependency graph the next phase assumes.

## Part 2 — outside the app (10–)

Everything in part 1 is one app in one repo. What changes when there's more
than one — a design system shared across products, a monorepo with
independently deployable features, a micro-frontend split, a module-
federation boundary?

| # | topic | branch | the one-line takeaway |
|---|---|---|---|
| 10 | [Monorepo fundamentals](10-monorepo.md) | `topic/10-monorepo` | The repo becomes an npm workspaces + Turborepo monorepo; Devlog moves to `apps/devlog` unchanged. CI needed zero edits — the root script *names* stayed stable while what they fan out to changed completely |
| 11 | [Shared UI package](11-shared-ui.md) | `topic/11-shared-ui` | The presentational-component test from topic 02 ("does it know anything about this app?") decides what moves into `packages/ui`; `Toaster` splits at exactly that line — a pure `ToastList` in the package, the store-wired half stays in the app |
| 12 | [A second app](12-second-app.md) | `topic/12-second-app` | `apps/admin` proves the reuse — a `<Button>`/`<Avatar>` dropped in with zero CSS written, themed correctly (dark mode included) because tokens moved into `packages/ui/styles.css`. Deliberately does NOT share data or React Query with Devlog — a second app repeats only the decisions that solve its own problem |
| 13 | [Shared logic beyond UI](13-shared-logic.md) | `topic/13-shared-logic` | `packages/api-client` closes topic 12's gap — Admin now moderates Devlog's actual posts. No React in this package, unlike `packages/ui`: not every shared package looks like the first one. Honest limit found: shared *code*, not a shared *runtime* — two dev processes each hold their own copy of the fake in-memory db |
| 14 | [Build orchestration at scale](14-build-orchestration.md) | `topic/14-build-orchestration` | `--filter=...[ref]` computes the actually-affected packages from a git diff (verified against two real diffs); `globalDependencies` fixes cache invalidation for inputs no single package owns; CI wired to run only what a PR's diff could break. Remote caching described, not built — needs an external service this repo doesn't have |

Planned next: versioning & release (15), micro-frontends (16), cross-app
cross-cutting concerns (17) — subject to change as we go, same as part 1.
