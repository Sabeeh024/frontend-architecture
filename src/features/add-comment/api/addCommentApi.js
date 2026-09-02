import { fake, db, nextId } from '../../../shared/api/client'

export function addComment(postId, { body, authorId }) {
  return fake(() => {
    const comment = { id: nextId('c'), postId, authorId, body, createdAt: new Date().toISOString() }
    db.comments.push(comment)
    return comment
  })
}
