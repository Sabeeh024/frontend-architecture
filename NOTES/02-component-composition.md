# 02 — Component composition

Branch: `topic/02-composition` (built on `structure/feature-based`).

```bash
git switch topic/02-composition
npm run dev
git diff structure/feature-based topic/02-composition   # see exactly what moved
```

Composition = building behaviour by **combining** small components/hooks rather
than adding props/branches to one big component. The question each pattern
answers: *who decides what renders, and where does shared logic live?*

Two real problems in Devlog drive the examples:

- **A.** Every screen repeats `loading → spinner`, and would repeat empty/error.
- **B.** The comment UI (list + count + form) shares state, but different
  screens might want to arrange those pieces differently.

---

## Pattern 1 — Container / Presentational (aka smart / dumb)

Split one component into "gets the data" and "renders the data".

| file | role |
|---|---|
| `posts/FeedPage.jsx` | **container** — calls `usePosts()`, decides nothing about markup |
| `posts/PostList.jsx` | **presentational** — `({ posts }) => …`, no hooks, no fetch, no router |

**Why:** `PostList` is now trivially testable (pass an array, assert output),
reusable (search results, a profile page), and Storybook-able. The container
holds the messy async part.

**Cost:** two files where there was one. Don't split a component that has no
logic to separate — it's ceremony. Split when the rendering is reused OR the
logic is worth testing in isolation.

**Note:** this is the same instinct as the folder-structure `entities` vs
`features` split from topic 01 — separate "what it is" from "how it's used",
one level down.

---

## Pattern 2 — Render-prop + slots  (`shared/ui/Async.jsx`)

A component that owns a *decision*, and lets the caller supply the pieces.

```jsx
<Async
  state={posts}                       // a useAsync() result
  loading={<p>Loading feed…</p>}      // slot
  empty={<p>No posts yet.</p>}        // slot
>
  {(data) => <PostList posts={data} />}   {/* render prop: function as children */}
</Async>
```

`Async` encapsulates the `pending / error / empty / success` ladder **once**.
`FeedPage` went from a 4-branch component to a declarative block.

- **Slot** = you pass *elements* for named holes (`loading`, `empty`).
- **Render prop** = you pass a *function* that receives internal state and
  returns elements (`children={(data) => …}`). Same idea, function form, used
  when the child needs the parent's data.

**Good when:** many call sites share one control-flow shape (loading ladders,
lists with separators, virtualised rows, permission gates).

**Cost:** indirection. A stack of nested render props ("callback hell in JSX")
is hard to read. Modern code often prefers the hook (pattern 3) and keeps
render-prop components only for the genuinely reusable control flow.

---

## Pattern 3 — Headless hook  (`shared/lib/useAsync.js`)

All the logic, **zero markup**. The caller renders however it wants.

```js
export function useAsync(fn, deps) { … returns { status, data, error, reload } }

// posts/usePosts.js  — a 2-line domain wrapper
export const usePosts = () => useAsync(() => getPosts(), [])
```

Compare the two consumers on this branch:

| screen | style | trade-off |
|---|---|---|
| `FeedPage` | `useAsync` → `<Async>` | least code, prescribed ladder |
| `PostPage` | `useAsync` → hand-written `if` branches | more code, total control (custom "not found", etc.) |

**Headless is the dominant modern pattern** — React Query, SWR, Zustand, Radix,
React Table, Downshift all ship logic as hooks and let you own the DOM. It
composes better than render props (no JSX nesting) and doesn't lock you into
one visual.

**Cost:** each caller re-writes the rendering. If that rendering *should* be
consistent, pair the hook with a presentational component or an `<Async>`.

---

## Pattern 4 — Compound components  (`features/comments/ui/Comments.jsx`)

Several components that **only make sense together** and share state
*implicitly* through context, while the consumer controls layout.

```jsx
<Comments postId={id}>          {/* holds state via useComments + context */}
  <section className="comments">
    <h2>Comments (<Comments.Count />)</h2>
    <Comments.List />
    <Comments.Form />
  </section>
</Comments>
```

No prop-drilling: `Comments.Count`, `.List`, `.Form` each pull `{ comments,
loading, add }` from context. A different screen can reorder them, wrap them,
drop `.Count`, put `.Form` on top — **without any new props on `Comments`**.

This is how `<select><option>`, Radix `<Tabs>`, Reach `<Menu>` work.

**Good when:** a family of parts must coordinate, but you can't predict every
layout the parts will be arranged in.

**Costs:**
- Sub-components throw if used outside the parent (we guard with a context
  check + clear error).
- The API is "magic" — the state flow is invisible at the call site.
- Overkill when there's exactly one layout forever (then just take props).

---

## How to choose (rule of thumb)

| situation | reach for |
|---|---|
| rendering reused, or worth testing alone | **presentational component** + container |
| logic reused, rendering varies | **headless hook** |
| one control-flow shape repeated at many call sites | **render-prop / slot component** |
| coordinated family of parts, caller controls layout | **compound components** |
| just one component, one layout, a little branching | **props + `{condition && …}`** — don't over-compose |

Most real components combine several: a headless hook for logic, a
presentational component for the common look, props for the last-mile tweaks.

## Next questions this raises

- `useAsync` refetches on every mount and shares nothing between components.
  When does "just a hook" stop being enough → server-cache libraries
  (React Query / SWR)? (topic 03: data fetching & caching)
- Prop drilling vs context vs a store — when is each right? (topic 04: state)
- Compound components need context; context re-renders all consumers on any
  change — when does that bite, and what fixes it? (selectors, splitting context)
