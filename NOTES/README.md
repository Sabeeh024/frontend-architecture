# Frontend architecture — inside the app

Nine topics, each explored by actually building it into **Devlog** (a tiny
feed/post/comments app with a mock in-memory API) on its own branch, then
written up here. `master` holds only these notes and the pristine scaffold —
every branch below carries the code for that topic, chained onto the one
before it.

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

## Next: outside the app

Everything above is one app in one repo. What changes when there's more than
one — a design system shared across products, a monorepo with independently
deployable features, a micro-frontend split, a module-federation boundary?
That's the next set of topics, not yet started.
