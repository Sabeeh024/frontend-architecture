import { getPosts, getPost } from './api'

// One definition of each query, shared by the route loader (prefetch) and the
// component hook (subscribe). Same queryKey => the loader's fetch and the
// hook's read hit the same cache entry.
export const postsQuery = () => ({
  queryKey: ['posts'],
  queryFn: getPosts,
})

export const postQuery = (id) => ({
  queryKey: ['posts', id],
  queryFn: () => getPost(id),
})
