import { fake, db } from '../../../shared/api/client'

const withAuthor = (post) => ({
  ...post,
  author: db.users.find((u) => u.id === post.authorId) ?? { id: '?', name: 'Unknown' },
})

export function getPosts() {
  return fake(() => db.posts.map(withAuthor))
}

export function getPost(id) {
  return fake(() => {
    const post = db.posts.find((p) => p.id === id)
    return post ? withAuthor(post) : null
  })
}
