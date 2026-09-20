import { fake, db } from './client'

const withAuthor = (post) => ({
  ...post,
  author: db.users.find((u) => u.id === post.authorId) ?? { id: '?', name: 'Unknown' },
})

export function getPosts() {
  return fake(() => db.posts.map(withAuthor), 'GET /posts')
}

export function getPost(id) {
  return fake(() => {
    const post = db.posts.find((p) => p.id === id)
    return post ? withAuthor(post) : null
  }, `GET /posts/${id}`)
}

// The moderation action apps/admin needs; apps/devlog never calls this and
// doesn't display `status` anywhere — an inert field to it. Same backend,
// two apps reading and (in Admin's case) writing different slices of it.
export function setPostStatus(id, status) {
  return fake(() => {
    db.posts = db.posts.map((p) => (p.id === id ? { ...p, status } : p))
    return withAuthor(db.posts.find((p) => p.id === id))
  }, `PATCH /posts/${id}`)
}
