# frontend-architecture

A learning sandbox exploring frontend architecture — see [`NOTES/README.md`](NOTES/README.md)
for the full write-up, topic by topic.

As of topic 10 this is an **npm workspaces + Turborepo monorepo**:

```
apps/
  devlog/     the example app (feed / post / comments), topics 01-09
packages/     (not yet — topic 11)
```

## Commands (from the repo root)

```bash
npm install       # installs every workspace's deps in one pass
npm run dev        # -> turbo run dev      (starts every app's dev server)
npm run build       # -> turbo run build
npm run lint         # -> turbo run lint     (oxlint + eslint boundaries, per app)
npm run test          # -> turbo run test
npm run depgraph:check # -> turbo run depgraph:check
```

Or run a single app's scripts directly from its folder, e.g. `cd apps/devlog && npm run dev`.
