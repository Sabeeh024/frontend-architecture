# 03 — Data fetching & caching

Branch: `topic/03-data-fetching` (built on `topic/02-composition`).

```bash
git switch topic/03-data-fetching
npm run dev            # watch the request meter (bottom-left)
git log --oneline topic/02-composition..topic/03-data-fetching
```

Two commits:
1. **instrument** — a `RequestMeter` counting every fake HTTP call, by endpoint.
2. **swap** — replace the hand-rolled `useAsync` with TanStack Query.

---

## The problem: `useAsync` is fetch-on-mount and nothing else

Our topic-02 hook (`shared/lib/useAsync.js`) does exactly one thing: run the
promise in `useEffect`, track `status`. What it does *not* do:

| gap | symptom in the app |
|---|---|
| **No cache** | leave the feed, come back → full refetch of identical data |
| **No dedup** | two components calling `usePosts()` → two requests |
| **No request cancellation / race handling** | fast nav between posts can land the wrong response (we patched this with an `alive` flag — every hook re-implements it) |
| **No background refresh** | data goes stale and stays stale until a manual `reload()` |
| **Invalidation is manual** | adding a comment had to thread `reload()` from the entity hook → widget → form (topic 02's "re-gluing tax") |
| **StrictMode double-fetch** | dev renders mount→unmount→mount; no dedup means 2× every request |

**Measured:** navigate feed → post p1 → back to feed, with the meter running:

```
GET /posts × 4          (feed visited 2×, StrictMode 2× each)
GET /posts/p1 × 2
GET /posts/p1/comments × 2
-------------------------
8 requests for data that never changed
```

You *can* fix each gap by hand. You'd be rebuilding a cache library, badly.

---

## The fix: a server-cache library (TanStack Query / React Query)

The reframe: **server data isn't "state" you own — it's a local cache of
someone else's state.** Treat it that way and the tool changes.

### What changed in the code

```js
// app/App.jsx
<QueryClientProvider client={queryClient}>…<ReactQueryDevtools /></QueryClientProvider>

// app/queryClient.js — one place for cache policy
new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

// features/posts/usePosts.js   — was ~5 lines of useAsync wrapper
export const usePosts = () => useQuery({ queryKey: ['posts'], queryFn: getPosts })

// features/posts/usePost.js
export const usePost = (id) =>
  useQuery({ queryKey: ['posts', id], queryFn: () => getPost(id) })

// features/comments/useComments.js — read + write, no more reload() prop
const query = useQuery({ queryKey: ['comments', postId], queryFn: … })
const mutation = useMutation({
  mutationFn: (input) => addComment(postId, input),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
})
```

`<Async>` and the compound `<Comments>` from topic 02 **did not change** — v5's
`useQuery` already returns `status: 'pending' | 'error' | 'success'`, so the
composition patterns compose right over it.

### Same navigation, now

```
GET /posts × 1
GET /posts/p1 × 1
GET /posts/p1/comments × 1
-------------------------
3 requests  (8 → 3)
```

Revisiting the feed = cache hit, zero requests (data still within `staleTime`).
StrictMode's second mount = deduped. Add a comment → the mutation invalidates
`['comments', p1]` and **both** `Comments.List` and `Comments.Count` refetch and
update — no prop wiring.

### Key concepts (the whole mental model)

- **queryKey** — the cache address. `['posts']`, `['posts', id]`,
  `['comments', postId]`. Same key across components = one shared cache entry =
  automatic dedup. Key changes = new fetch.
- **staleTime** — how long a cached value is "fresh". Fresh → served instantly,
  no network. Stale → served instantly *and* refetched in the background.
- **gcTime** (was cacheTime) — how long an unused entry lingers before eviction.
- **invalidateQueries(key)** — "this data might be wrong now, refetch it." The
  standard way writes tell reads they're dirty.
- **useMutation** — writes. Gives you `isPending`/`error`, `onSuccess` for
  invalidation, and enables optimistic updates.
- **Devtools** — the flower bottom-right; shows every cache entry, its state,
  its data. Turn it on when reasoning about "why did/didn't this refetch".

---

## Trade-offs / when NOT to

- **Bundle cost:** ~13 KB gzip here (`237 → 273 KB` raw). Real, but small next to
  what you delete.
- **It's for *server* state only.** Form inputs, "is the modal open", selected
  tab — that's client state, use `useState`/context/a store (topic 04). Cramming
  UI state into a query cache is an anti-pattern.
- **Tiny apps / one fetch, one screen, never revisited:** `useAsync` or even a
  raw `useEffect` is fine. The library earns its place when the same data is
  read in multiple places or survives navigation.
- **Alternatives:** SWR (smaller, simpler, same idea), or a framework's own
  loader (Next.js RSC + `fetch` cache, Remix/React-Router loaders) which move
  fetching *out* of components entirely — a different answer to the same problem,
  covered when we look at routing.

---

## Where this leaves the architecture

The query cache is now a de-facto **shared store for server data** — any
component, any depth, calls `usePosts()` and hits the same entry. That quietly
removed most of the "how do I share fetched data" pressure that would otherwise
push you toward Redux/Context. What's left to share is genuinely *client* state.

## Next questions this raises

- Optimistic updates: show the comment instantly, roll back on failure — worth
  the complexity? (a `useMutation` `onMutate` exercise)
- What about the remaining client state (auth user is in Context, UI state is
  scattered in `useState`)? → topic 04: state management
- If a framework loader can fetch before the component renders, why fetch in
  components at all? → topic 05: routing as architecture
