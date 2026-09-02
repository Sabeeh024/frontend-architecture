import { fake, db } from './client'

export function login(name) {
  return fake(() => {
    const existing = db.users.find((u) => u.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    const user = { id: `u${db.users.length + 1}`, name }
    db.users.push(user)
    return user
  })
}
