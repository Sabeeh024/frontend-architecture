# 13 — Shared logic beyond UI

Branch: `topic/13-shared-logic` (built on `topic/12-second-app`).

```bash
git switch topic/13-shared-logic
npm run build              # 4 workspaces: @repo/api-client, @repo/ui, admin, devlog
cd apps/devlog && npm run dev   # :5174 or similar
cd apps/admin  && npm run dev   # separate terminal, separate port
```

## The gap topic 12 left open, on purpose

Admin's first version had its own three-post fake dataset — deliberately
disconnected from Devlog's, so the duplication would be visible instead of
assumed away. This topic removes it: `packages/api-client` is now the one
mock backend, and both apps are clients of it.

## What moved

Everything that used to live in `apps/devlog/src/shared/api/client.js` plus
the domain functions scattered across each feature's `api.js`:

```
packages/api-client/src/
  client.js   in-memory db, fake() latency wrapper, request instrumentation, resetDb
  posts.js    getPosts, getPost, setPostStatus   (new — Admin's moderation action)
  comments.js getComments, addComment
  auth.js     login
  index.js    the public barrel — same discipline as packages/ui's
```

**No React import anywhere in this package.** `packages/ui` (topic 11) has a
`peerDependencies.react` because components need a framework; a data/fetch
layer doesn't. Worth noticing as its own small lesson: not every shared
package looks like the first one you built. `@repo/api-client` is plain JS —
any framework, or none, could consume it.

**`setPostStatus` is new**, added specifically for Admin's "Feature/Unfeature"
action. Devlog never calls it and doesn't display the `status` field it
writes — an inert extra column to Devlog, load-bearing to Admin. That's what
a shared backend usually looks like in practice: not every client uses every
field or endpoint.

## The thin-adapter decision

Devlog's feature files didn't start importing `@repo/api-client` directly.
Each keeps its own one-line `api.js`:

```js
// features/posts/api.js
export { getPosts, getPost } from '@repo/api-client'
```

`queries.js` still does `import { getPosts, getPost } from './api'` — **zero
changes** to any file except the three `api.js` adapters themselves. Two
reasons this beat importing the package everywhere directly:

1. **One seam per feature**, not per call site, if a feature ever needs to
   reshape a response or mock the network in a test — `useComments.test.jsx`'s
   `vi.mock('./api', …)` still targets a real local file and needed zero
   edits, because `./api` still exists, it just delegates now.
2. **The barrel discipline holds.** A feature's public surface is still
   "whatever `index.js`/`api.js` exports," regardless of whether the
   implementation behind it is 40 lines of local code or a one-line
   re-export from a workspace package. Nothing about *consuming* the feature
   changed when its data source moved out of the repo's `src/` and into
   `packages/`.

## Verified

- `build`/`lint`/`test`/`depgraph:check` from the root now span **four**
  workspaces automatically. All 22 of Devlog's tests still pass, unchanged —
  the adapter seam absorbed the entire move.
- Dependency-cruiser: 66 modules, zero violations. Importing from
  `node_modules/@repo/api-client` doesn't touch any `src/`-scoped topic-07
  boundary rule, same as `@repo/ui` didn't in topic 11.
- **Both apps running at once, browser-verified:** Admin shows the exact same
  two posts and authors Devlog shows — including `p2` already seeded
  `"featured"`, which only makes sense if they're reading the same data.
  Toggling "Feature" on the first post in Admin flips its badge and fires a
  toast correctly.

## The honest limit: shared code, not a shared runtime

Toggling a post's status in Admin's dev server does **not** change what
Devlog's already-running dev server shows. Not a bug — `npm run dev` for
each app starts its **own** Node process, and `packages/api-client`'s
`db` (a module-level `let`) is instantiated once per process. Two apps
importing the same source doesn't mean two apps sharing the same live
memory; it means two apps that would behave identically *if pointed at the
same running instance of something*. In this repo that "something" is a
fake in-memory object, so there's nothing to point at. In a real product,
that something is an actual backend (or one shared dev-mode mock server) —
the two apps talking to one real HTTP endpoint is what turns "same code" into
"same data, live." This repo's mock is convenient for offline, framework-free
demos but was never going to give that for free, and pretending otherwise
would have been the wrong lesson to leave here.

## Next questions this raises

- If two apps needed **live-synced** mock data (not just the same shape),
  the fake backend itself would have to become a real (if tiny) server —
  `msw`'s Node server mode, or an actual Express/Hono process the workspace
  runs alongside both apps. A `packages/mock-server` a `turbo dev` pipeline
  starts once, shared by every app, rather than importing an in-memory
  module per app.
- Now that data logic is shared too, is `packages/api-client` where
  TypeScript types / a schema (Zod, OpenAPI-generated) for `Post`/`Comment`/
  `User` should live? Neither app has types today (still plain JS
  throughout) — worth its own topic once the shape of shared data gets more
  than three fields.
- `packages/ui` and `packages/api-client` are each hand-versioned at
  `0.0.0`, workspace-only. Topic 15 (versioning & release) is where that
  stops being fine — the moment either package needs a changelog a consumer
  actually reads before upgrading.
