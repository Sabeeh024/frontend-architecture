// Admin's own fake backend — deliberately NOT shared with apps/devlog.
// Two apps duplicating "a list of posts with an id/title/author" is exactly
// the gap topic 13 (shared logic beyond UI) exists to close; leaving it
// duplicated here for now is what makes that gap visible instead of assumed.
let posts = [
  { id: 'p1', title: 'On layered architecture', author: 'Ada Lovelace', status: 'pending' },
  { id: 'p2', title: 'On feature slicing', author: 'Alan Turing', status: 'featured' },
  { id: 'p3', title: 'A draft nobody has reviewed yet', author: 'Grace Hopper', status: 'pending' },
]

export function fetchPosts() {
  return new Promise((resolve) => setTimeout(() => resolve([...posts]), 400))
}

export function toggleFeatured(id) {
  posts = posts.map((p) => (p.id === id ? { ...p, status: p.status === 'featured' ? 'pending' : 'featured' } : p))
  return new Promise((resolve) => setTimeout(() => resolve(posts.find((p) => p.id === id)), 200))
}
