# 01 — Folder structure: layer-based vs feature-based

Same app ("Devlog": a feed, a post page with comments, a mock login) built two
ways. Each lives on its own git branch off `master` (the pristine scaffold).

| | branch |
|---|---|
| Layer-based | `structure/layered` |
| Feature-based | `structure/feature-based` |
| Feature-Sliced Design | `structure/fsd` |

```bash
git switch structure/layered      # or structure/feature-based
npm run dev
```

---

## The app's "modules" (same in both)

- **auth** — mock login, current-user context, `useAuth`, `LoginPage`
- **posts** — `getPosts/getPost`, `usePosts/usePost`, `PostCard`, `FeedPage`, `PostPage`
- **comments** — `getComments/addComment`, `useComments`, `CommentList`, `CommentForm`
- **shared** — `Button`, `Spinner`, `Avatar`, `formatDate`, fake API client
- **app shell** — router + providers + top bar

Only the *placement* of these files changes between the two branches.

---

## Layer-based (`structure/layered`)

Group by **what a file is**.

```
src/
  api/        client.js  auth.js  posts.js  comments.js
  components/ Button  Spinner  Avatar  Layout  PostCard  CommentList  CommentForm
  context/    AuthContext.jsx
  hooks/      useAuth  usePosts  usePost  useComments
  pages/      FeedPage  PostPage  LoginPage
  utils/      formatDate.js
  styles/     app.css
  App.jsx  main.jsx
```

**Good when:**
- Small app, or a team that all touches everything.
- You're still discovering the domain — you don't yet know what the "features" are.
- Strong, obvious layering (every screen = page + hooks + api call).

**Hurts when it grows:**
- Adding one feature = touching 4–5 folders; a feature is never "one place".
- `hooks/` and `components/` become 40-item junk drawers with no cohesion.
- Nothing stops `usePosts` importing `useComments` importing `useAuth` — the
  dependency graph is a hairball because the folders don't encode boundaries.
- Deleting a feature means hunting its fragments across every layer.
- Hard to answer "what does the comments feature depend on?" — the question
  isn't expressible in the structure.

---

## Feature-based (`structure/feature-based`)

Group by **what a file is for**. Also called feature-sliced / vertical slices.

```
src/
  app/                 App.jsx  AppLayout.jsx      (composition root)
  features/
    auth/     api  AuthContext  useAuth  LoginPage       index.js
    posts/    api  usePosts  usePost  PostCard  FeedPage  PostPage   index.js
    comments/ api  useComments  CommentList  CommentForm  CommentsSection  index.js
  shared/
    api/client.js   ui/{Button,Spinner,Avatar}   lib/formatDate
  styles/app.css   main.jsx
```

Two rules make this work (and they're the whole point):

1. **Each feature has a public API — its `index.js`.** Outside code imports
   `from '../comments'`, never `from '../comments/CommentForm'`. You can rename,
   split, or rewrite everything behind `index.js` without touching callers.
2. **Import direction is one-way:** `app → features → shared`. Features may
   depend on *more foundational* features (here `comments → auth`), but never in
   a cycle. `shared/` imports nothing feature-specific.

See it in the code:
- `features/comments/CommentForm.jsx` → `import { useAuth } from '../auth'`
  (cross-feature, through the public API)
- `features/posts/PostPage.jsx` → `import { CommentsSection } from '../comments'`
  (posts composes comments without knowing how it works)
- `features/*/api.js` each build on `shared/api/client.js`

**Good when:**
- Multiple people/teams; features evolve independently.
- Features get added and removed (delete the folder + its routes — done).
- You want the structure to *document* the domain and its dependencies.

**Costs / pitfalls:**
- You must decide what's a "feature" vs what's "shared" — and you'll get it
  wrong sometimes. Premature slicing on a tiny app is just ceremony.
- The `index.js` barrels are discipline, not enforcement — nothing stops a
  teammate deep-importing unless you add a lint rule
  (`eslint-plugin-boundaries`, `import/no-restricted-paths`, or Nx tags).
- "Where does this shared-by-two-features thing go?" is a recurring judgement
  call. Rule of thumb: keep it in the feature that owns it until a *second*
  feature needs it, then move to `shared/` (or a dedicated feature).
- Barrel files can slow bundlers / hurt tree-shaking if they re-export huge
  surfaces. Keep them thin.

---

## The real distinction

Layer-based optimises for "show me all the X". Feature-based optimises for
"let me work on Y without touching anything else". As an app grows, you ask the
second question far more often than the first — which is why most codebases
drift toward feature-based, and why frameworks (Next.js app router, Remix,
Angular) nudge you there by default.

Hybrid is normal and fine: feature folders for the domain, a thin `shared/`
(or `components/ui`, `lib/`) layer underneath for the genuinely generic stuff.

## Feature-Sliced Design (`structure/fsd`)

The same app again, sliced into FSD's six layers. This is "feature-based, but
'feature' was doing too many jobs so we split it into named tiers."

### The layers (strict import direction: a layer may only import from layers *below* it)

```
src/
  app/       providers.jsx  router.jsx  App.jsx          — wiring, global setup
  pages/     feed/  post/  login/                        — one slice per route, thin
  widgets/   navbar/  comments/                          — big self-contained UI blocks
  features/  auth/  add-comment/                         — one user *action* each
  entities/  session/  post/  comment/                   — business objects + their data
  shared/    api/  ui/  lib/                             — generic, zero domain knowledge
```

Inside every slice, the same **segments**: `ui/` (components), `model/` (hooks,
state, stores), `api/` (requests). `shared/` has the segments directly, no slices.

### How the old "comments feature" split across layers

| was (feature-based) | now (FSD) | why |
|---|---|---|
| `comments/api.js` `getComments` | `entities/comment/api/commentsApi.js` | reading the Comment object = entity concern |
| `comments/useComments` (read) | `entities/comment/model/useComments.js` | entity read model; exposes `refetch()` |
| `comments/CommentList` | `entities/comment/ui/CommentList.jsx` | how a Comment renders |
| `comments/api.js` `addComment` | `features/add-comment/api/addCommentApi.js` | *writing* a comment = a user action |
| `comments/CommentForm` | `features/add-comment/ui/CommentForm.jsx` | the action's UI |
| `comments/CommentsSection` | `widgets/comments/CommentsSection.jsx` | stitches the entity + the feature into a block |
| `auth/` (whole feature) | `entities/session` (state) + `features/auth` (the login form) | "who am I" vs "the act of logging in" |

### What the split buys — and costs

**Buys:**
- `auth` stops being a vague "feature." `entities/session` = current-user state
  (plumbing, everyone reads it); `features/auth` = just the login form. Different
  roles, different layers, visible in the tree.
- `entities/post` and `entities/comment` are reusable building blocks. A future
  `edit-post` or `delete-comment` feature reuses the entity, adds only its action.
- The dependency graph is now enforceable with one rule: "import only downward."
  No feature→feature tangle to reason about.

**Costs — visible right in this small app:**
- **Split state.** Reading comments (`entities/comment`) and adding one
  (`features/add-comment`) are now separate slices, so they can't share
  useState. The widget re-glues them: it owns nothing, calls `refetch()` after a
  successful add. In the flat feature-based branch one hook did both. This
  re-gluing tax is the price of the split (a server-cache lib like TanStack Query
  makes it a non-issue — the cache is the shared state).
- **More files, more ceremony.** ~35 files for what layer-based did in ~20.
- **Judgement calls multiply.** Is "navbar" a widget or app-level? Is the login
  form a feature or does it belong to the session entity? FSD has answers, but
  you have to learn them.
- **`shared/` still a catch-all**, just a smaller one.

### When FSD is worth it

Large app, multiple teams, features added/removed often, and you want the folder
tree to *be* the architecture diagram. On a 5-feature app it's overhead you're
paying against future growth — fine as a deliberate bet, wrong as a default.

### Compare the three branches

| | files | "add a feature" touches | feature→feature | graph enforced by |
|---|---|---|---|---|
| `structure/layered` | fewest | 4–5 folders | uncontrolled | nothing |
| `structure/feature-based` | middle | 1 folder + routes | allowed, one-way, by convention | barrels + discipline |
| `structure/fsd` | most | 1 slice per layer touched | banned; go through a lower layer | one rule: import downward |

---

## Next questions this raises

- Who's allowed to import whom — and how do you *enforce* it? (lint boundaries)
- When two features need the same data, does that data get its own feature?
- Does `comments → auth` mean auth is really "infrastructure", not a feature?
- How does this hold up with 30 features? (→ feature-sliced-design's layers:
  `app / pages / widgets / features / entities / shared`)
