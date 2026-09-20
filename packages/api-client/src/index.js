// The shared backend contract — every app in the workspace is a client of
// this same mock API. Same barrel discipline as packages/ui: consumers
// import from here, never reach into client.js directly.
export { getPosts, getPost, setPostStatus } from './posts'
export { getComments, addComment } from './comments'
export { login } from './auth'

// Test/dev seams, still part of the public contract (devlog's test setup and
// its RequestMeter dev-tool both need these).
export { resetDb, requestLog, onRequest } from './client'
