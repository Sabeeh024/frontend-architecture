# @repo/ui

The shared UI kit — every component here is pure presentation: props in, DOM
out, no app-specific state (no store, no router, no i18n catalog). That's
the test applied when deciding what moved here from `apps/devlog` and what
stayed (topic 11's write-up, `NOTES/11-shared-ui.md`, has the reasoning).

## Exports

| component | props | notes |
|---|---|---|
| `Button` | `variant`, ...native button props | `variant="ghost"` for the borderless style |
| `Spinner` | `label` | |
| `Avatar` | `name` | renders initials |
| `Async` | `state`, `children`, `loading`, `error`, `empty`, `isEmpty` | render-prop over `{ status, data, error }` — a `useQuery` result fits directly |
| `ErrorBoundary` | `fallback`, `children` | class component; `fallback` can be a node or `(error, reset) => node` |
| `ToastList` | `toasts`, `onDismiss` | presentational only — the app owns the toast *store* and passes props down |

## Consuming it

Workspace-only right now (`"@repo/ui": "*"` in a consumer's `package.json`,
resolved by npm workspaces to `packages/ui` via a symlink — no publish step).
Ships as source (JSX, untranspiled): the consumer's own bundler processes it,
same as any first-party file. See the topic-11 notes for what that trades
away and when a real build step earns its keep.

## Styling

Components emit class names (`btn`, `spinner`, `avatar`, `toast`, …) but ship
**no CSS of their own** — the consuming app's stylesheet defines the look
(today: `apps/devlog/src/styles/app.css`). Two apps sharing this package
today would only look consistent if they also shared that CSS. Flagged as a
gap in the topic-11 notes, not solved yet.
