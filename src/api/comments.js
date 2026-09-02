import { fake, db, nextId } from './client'

const withAuthor = (c) => ({
  ...c,
  author: db.users.find((u) => u.id === c.authorId) ?? { id: '?', name: 'Unknown' },
})

export function getComments(postId) {
  return fake(() => db.comments.filter((c) => c.postId === postId).map(withAuthor))
}

export function addComment(postId, { body, authorId }) {
  return fake(() => {
    const comment = {
      id: nextId('c'),
      postId,
      authorId,
      body,
      createdAt: new Date().toISOString(),
    }
    db.comments.push(comment)
    return withAuthor(comment)
  })
}
