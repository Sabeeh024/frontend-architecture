import { describe, expect, it, vi } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { makeQueryClient } from '../../test/utils'
import * as api from './api'
import { useComments } from './useComments'

// Wrap addComment as a spy over its real impl: most tests hit the real
// in-memory api, one test stubs the timing via mockImplementationOnce.
vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, addComment: vi.fn(actual.addComment) }
})

// Layer: data hook (React Query). renderHook + a QueryClientProvider wrapper.
function wrapper() {
  const client = makeQueryClient()
  return ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const ada = { id: 'u1', name: 'Ada Lovelace' }

describe('useComments', () => {
  it('loads the post’s comments', async () => {
    const { result } = renderHook(() => useComments('p1'), { wrapper: wrapper() })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0].body).toMatch(/30 features/)
  })

  it('add() appends the comment optimistically before the write resolves', async () => {
    // Hold the write open so the optimistic window is observable.
    let finishWrite
    api.addComment.mockImplementationOnce(
      (postId, input) =>
        new Promise((resolve) => {
          finishWrite = () =>
            resolve({ id: 'srv-1', postId, ...input, author: ada, createdAt: '2026-01-01T00:00:00Z' })
        }),
    )

    const { result } = renderHook(() => useComments('p1'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let write
    act(() => { write = result.current.add({ body: 'nice', author: ada }) })

    await waitFor(() => expect(result.current.comments).toHaveLength(2))
    expect(result.current.comments[1]).toMatchObject({ body: 'nice', pending: true })
    expect(result.current.comments[1].id).toMatch(/^temp-/)

    await act(async () => { finishWrite(); await write })
  })

  it('reconciles the optimistic row with the server row on settle', async () => {
    const { result } = renderHook(() => useComments('p1'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.add({ body: 'nice', author: ada }))

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(2)
      expect(result.current.comments[1]).toMatchObject({ body: 'nice' })
      expect(result.current.comments[1].pending).toBeUndefined()
      expect(result.current.comments[1].id).not.toMatch(/^temp-/)
    })
  })

  it('rolls back if the server rejects', async () => {
    const { result } = renderHook(() => useComments('p1'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      result.current.add({ body: 'boom', author: null }), // author.id throws in mutationFn
    ).rejects.toBeTruthy()

    await waitFor(() => expect(result.current.comments).toHaveLength(1))
  })
})
