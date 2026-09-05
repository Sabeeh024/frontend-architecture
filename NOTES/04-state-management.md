# 04 — State management

Branch: `topic/04-state` (built on `topic/03-data-fetching`).

```bash
git switch topic/04-state
npm run dev
```

## First: how much state is even left?

After topic 03, **server data is not in "state" anymore** — it lives in the
React Query cache, addressed by key, shared by every component that asks. That
deleted the single biggest reason apps reach for Redux.

What remains is genuine **client state**, and it splits by two questions:
*how far does it travel* and *how often does it change*.

| state | where it lives now | scope | change rate |
|---|---|---|---|
| comment draft, login name, `busy` flags | `useState` in the component | local | often |
| current user | `AuthContext` | whole app | rare |
| theme | `ThemeProvider` (Context) — **new** | whole app | rare |
| toasts | `toastStore` (Zustand) — **new** | fired anywhere, shown once | often |

## The four options, cheapest first

### 1. Local `useState`
Default. If only this component and maybe its children care, stop here.
The comment form's `body` never needed to be anything else.

### 2. Lift state up + pass props
Two siblings need the same value → hoist it to their parent, pass down.
Fine for 1–2 levels. Past that you're **prop drilling**: threading a value
through components that don't use it just to reach one that does.

Why toasts can't work this way: `Comments.Form` is
`App → Layout → PostPage → CommentsSection → Comments → Comments.Form` deep, and
the `<Toaster>` is up at the layout. You'd drill an `onToast` callback through
five components. Absurd — which is the motivation for the next two.

### 3. Context  (`app/theme/ThemeProvider.jsx`)
A provider holds the value; any descendant reads it with a hook, no drilling.

```jsx
<ThemeProvider>        // holds { theme, toggle }
  … <button onClick={useTheme().toggle}>   // 5 levels down, zero props
```

**Context is right for theme because:**
- read in many places
- changes **rarely** (a user toggles theme maybe once a session)
- when it *does* change, essentially everything should re-render anyway

**Context's trap:** every consumer re-renders on *every* value change, whole
object identity. Fine at 1 change/session (theme, auth). A footgun for state
that updates frequently or whose consumers only care about one slice — a toast
push would re-render every `useTheme()` caller if they shared a context.

*(Auth is in Context for the same reasons as theme — rare change, needed
everywhere. Leaving it there is the right call.)*

### 4. External store  (`shared/lib/toastStore.js`, Zustand)
State lives outside React. Components **subscribe to slices** via selectors;
only components whose slice changed re-render.

```js
export const useToastStore = create((set) => ({
  toasts: [],
  push: (msg, type) => { … },
}))

// non-component call site — no hook, no provider:
export const toast = { success: (m) => useToastStore.getState().push(m, 'success') }
```

```jsx
// Toaster.jsx — the ONLY subscriber to the list
const toasts = useToastStore((s) => s.toasts)
```

**Store is right for toasts because:**
- fired from anywhere, including non-React code (`toast.error()` in an api
  interceptor) — no provider to be inside, no hook rules
- changes often
- only `<Toaster>` cares about the list; the selector means firing a toast from
  `Comments.Form` re-renders **nothing** except `<Toaster>`
- no provider nesting; the store is just a module

Trade-offs: it's state outside React's model (dev-tools story is separate — for
Zustand it's a middleware), and it's easy to over-use for things that were fine
as `useState`. ~1 KB gzip for Zustand. Redux/RTK is the same idea with more
structure, ceremony, and a stricter update model — worth it on large apps with
many writers and a need for time-travel/middleware; overkill here.

## Decision guide

```
Only this subtree cares?              -> useState (lift if siblings share)
Widely read, changes rarely?          -> Context      (theme, auth, locale, feature flags)
Widely read, changes often,
  or consumers want just a slice,
  or fired from non-React code?        -> store        (toasts, selection, complex client models)
It's server data?                     -> React Query   (topic 03) — not "state" at all
```

Most apps end up with **all four at once**, and that's correct — they're not
competitors, they're a size ladder. The mistake is jumping to #3 or #4 for
something that #1 handled.

## Next questions this raises

- Context value identity: `<ThemeProvider>` passes a fresh `{ theme, toggle }`
  object every render — does that matter here? (only its children re-render, and
  rarely — but the fix is `useMemo`; worth knowing when it bites)
- Zustand can also persist, group into slices, and be used per-feature — when
  does one global store become several?
- The app now has 4 providers wrapping `<App>`. Provider hell — flatten with a
  compose helper, or push state into stores that need no provider?
- Routing still fetches inside components. What if the route *owned* the data
  and the client state for its screen? -> topic 05: routing as architecture
