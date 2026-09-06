// Whole-graph enforcement + visualization. ESLint checks one file at a time in
// the editor; dependency-cruiser walks the entire graph in CI and can draw it.
// The rules mirror eslint.config.js — belt and braces, plus `npm run depgraph`.
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'No import cycles — they make modules impossible to load or test in isolation.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-stays-generic',
      severity: 'error',
      comment: 'shared/ must not know about features or app — it has to stay reusable.',
      from: { path: '^src/shared/' },
      to: { path: '^src/(features|app)/' },
    },
    {
      name: 'features-dont-import-app',
      severity: 'error',
      comment: 'A feature must not reach up into the composition root.',
      from: { path: '^src/features/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Dead module — nothing imports it.',
      from: { orphan: true, pathNot: ['\\.(config|d)\\.[jt]s$', 'main\\.jsx$'] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: { extensions: ['.js', '.jsx'] },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
      archi: {
        collapsePattern: '^src/(app|features/[^/]+|shared/[^/]+)',
      },
    },
  },
}
