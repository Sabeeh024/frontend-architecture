// Thin adapter over the shared backend contract (topic 13: packages/api-client).
// Kept as its own file, rather than importing the package directly from
// queries.js, so this feature still has one seam to mock in tests or reshape
// later without touching the package.
export { getPosts, getPost } from '@repo/api-client'
