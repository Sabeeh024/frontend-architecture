import boundaries from 'eslint-plugin-boundaries'
import importX from 'eslint-plugin-import-x'
import globals from 'globals'

// Enforces ONE thing: the dependency rules the app was designed around.
// oxlint (npm run lint) still handles correctness / rules-of-hooks.
//
//   app     -> may import features + shared      (the composition root)
//   feature -> may import shared + other features (one-way; cycles caught below)
//   shared  -> may import shared only            (zero domain knowledge)
//   a feature is entered through its index.js (or a *Page/*Layout route entry)
//   no import cycles anywhere

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { boundaries, 'import-x': importX },
    settings: {
      'import-x/resolver': { node: { extensions: ['.js', '.jsx'] } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      'import-x/no-cycle': ['error', { maxDepth: Infinity }],

      'boundaries/dependencies': ['error', {
        default: 'disallow',
        policies: [
          { from: { element: { type: 'app' } },
            allow: { to: { element: { types: { anyOf: ['app', 'feature', 'shared'] } } } } },
          { from: { element: { type: 'feature' } },
            allow: { to: { element: { types: { anyOf: ['feature', 'shared'] } } } } },
          { from: { element: { type: 'shared' } },
            allow: { to: { element: { type: 'shared' } } } },
        ],
      }],

      // Public API: cross-element imports into a feature must hit its entry file.
      'boundaries/entry-point': ['error', {
        default: 'disallow',
        rules: [
          { target: ['feature'], allow: ['index.js', 'queries.js', '*Page.jsx', '*Layout.jsx'] },
          { target: ['shared', 'app'], allow: '**' },
        ],
      }],
    },
  },
]
