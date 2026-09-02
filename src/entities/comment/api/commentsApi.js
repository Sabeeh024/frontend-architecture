import { fake, db } from '../../../shared/api/client'

const withAuthor = (c) => ({
  ...c,
  author: db.users.find((u) => u.id === c.authorId) ?? { id: '?', name: 'Unknown' },
})

export function getComments(postId) {
  return fake(() => db.comments.filter((c) => c.postId === postId).map(withAuthor))
}
