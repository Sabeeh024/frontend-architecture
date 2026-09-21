# 17 — Cross-app cross-cutting concerns

Branch: `topic/17-cross-app-concerns` (built on `topic/16-micro-frontends`).

```bash
git switch topic/17-cross-app-concerns
cd apps/devlog && npm run dev -- --port 5173   # new terminal
cd apps/admin  && npm run dev -- --port 5174   # new terminal
```

Open devlog in two tabs and admin in a third. Toggle dark mode in one devlog
tab — the other devlog tab flips instantly, no reload. Toggle it in admin —
nothing happens in either devlog tab, and vice versa.

---

## The question, inherited from topic 16

Topic 06 answered "where does a cross-cutting concern live" for *one* app:
Context if only components read it, a store if non-React code needs it too.
Topic 16 then asked the harder version: once a concern needs to reach a
second, independently-built **app**, does that same answer still work?

The honest answer, built and verified here: **importing the same package
gives you the same *code*, not the same *runtime state*.** A store is a
module-level variable — every app that imports it gets its own copy, in its
own JS realm, in its own browser origin. Making two apps agree on a value
needs an explicit channel between them; the package alone doesn't provide
one.

---

## What got built: `@repo/theme`

Devlog's theme used to be exactly the topic-06-vintage pattern: a
`ThemeProvider` (Context + `useState`), read/written to `localStorage`
directly, useless to admin because it lived inside `apps/devlog/src`.

Extracted to `packages/theme` — a plain module store, same shape as
`shared/i18n/localeStore` (topic 09):

```js
// packages/theme/src/store.js
let theme = read()                    // localStorage, falls back to prefers-color-scheme
export function setTheme(value) { theme = value; apply(theme); localStorage.setItem(KEY, theme); notify() }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }

window.addEventListener('storage', (e) => {           // <- the actual point of this topic
  if (e.key === KEY) { theme = e.newValue; apply(theme); notify() }
})
```

```js
// packages/theme/src/useTheme.js
export function useTheme() {
  return { theme: useSyncExternalStore(subscribe, getTheme), toggle: toggleTheme }
}
```

Devlog's `ThemeProvider.jsx` is **deleted** — `RootLayout` and `ProfilePage`
now `import { useTheme } from '@repo/theme'` directly, and `providers.jsx`
drops to one provider (`QueryClientProvider` — the same "Context → store
deletes a provider" arithmetic as auth in topic 06, now paid off a second
time). Admin gets a theme toggle it never had before — three lines in
`App.jsx`, zero new CSS, because the tokens `packages/ui/styles.css` already
define for `[data-theme='dark']` (topic 12) just needed something to flip the
attribute.

---

## What was actually verified, and why the result matters

| scenario | same origin? | result |
|---|---|---|
| devlog tab A toggles → devlog tab B | ✅ same port, same origin | **flips live**, no reload — the `storage` event fired |
| devlog toggles → admin | ❌ `:5173` vs `:5174`, different origins | **admin unchanged** — confirmed `localStorage.getItem('theme')` on admin's origin stayed `null` the whole time |
| admin toggles independently | — | works correctly on its own — proves the *code* (the package) is genuinely shared, only the *state* isn't |

`localStorage` (and `BroadcastChannel`, and the `storage` event) are scoped
to an **origin** — scheme + host + port, exactly the same boundary a CORS
request would check. Two Vite dev servers on different ports are, to the
browser, as separate as two different companies' domains. This isn't a bug
in the store above; it's the platform being consistent, and it's exactly the
same isolation that makes one app's `localStorage` safe from another site's
JavaScript in the first place.

**The lesson this makes concrete:** "shared package" (build-time, topics 11
and 13) and "shared runtime state" (this topic) are independent axes.
`@repo/ui` and `@repo/api-client` share *logic* across apps with zero
runtime coupling — no channel needed, because each app just runs the logic
itself. `@repo/theme` shares logic too, **and** adds a same-origin sync
channel as a bonus — but that bonus stops exactly at the origin boundary,
because nothing about importing a module can cross it.

---

## What would actually cross the boundary (described, not built)

None of these were needed for one dark-mode toggle, and each is a real
infrastructure decision, not a config flag:

- **Same top-level origin** — serve devlog and admin under one domain
  (`app.example.com/` and `app.example.com/admin`, or same-domain
  subdomains + `document.domain` / a shared cookie with `Domain=`) so
  `localStorage`/cookies are actually shared. The most common real-world fix,
  and the one that costs the least new code — it's a deploy/reverse-proxy
  decision, not an app one.
- **A server round-trip** — persist the preference to the user's account;
  each app fetches it on load. Correct even across devices, but now every
  toggle is a network request instead of a synchronous write.
- **`postMessage` between windows/iframes** — works cross-origin by design,
  but needs each app to know about and hold a reference to the other's
  window — real coupling, not "import the same package."
- **A shared iframe or Web Worker acting as a broker** — a real Module
  Federation / micro-frontend "shell" pattern; more machinery than three
  small apps justify.

---

## Where this leaves the two axes, together

|  | build-time sharing (11, 13) | runtime sharing (16) | runtime **state** sync (17) |
|---|---|---|---|
| mechanism | npm workspace import | `import()` a URL | `storage` event (same-origin only) |
| crosses an origin? | n/a — compiled in | yes — that's the point | **no** — this is the finding |
| what's shared | code | a running component instance | a value, best-effort |

Three topics, three different things "shared across apps" turned out to
mean. None of them is "more architecturally correct" than the others — they
answer different questions, and picking the wrong one (e.g. assuming
`@repo/theme` would sync devlog and admin because topic 16 already proved
runtime loading works) is exactly the mistake this topic exists to rule out.

## Next questions this raises

- If devlog and admin ever *do* move under one origin (a reverse proxy,
  same-domain paths), does anything here change? No — the store already
  handles it correctly; it would just start working across apps for free,
  which is a nice property of having built the sync mechanism honestly
  instead of skipping it because "it won't matter in dev."
- Auth is the more consequential version of this same question: should
  logging into devlog also log you into admin? Same origin boundary,
  much higher stakes (a session token, not a color) — worth its own look
  before this repo adds a second consumer of `authStore`'s pattern.
- Is `packages/theme`'s `storage`-event listener doing anything harmful when
  there's only ever one tab open (the common case)? No measured cost found —
  one more addEventListener, module-scoped, never torn down — but it's the
  kind of thing worth profiling if this repo ever had a reason to.
