import { beforeEach, describe, expect, it } from 'vitest'
import { getAuthUser, useAuthStore } from './authStore'

// Layer: store. No React, no render — call actions, read getState().
// The store is a module singleton, so reset it per test.
beforeEach(() => {
  useAuthStore.setState({ user: null, pending: false })
})

describe('authStore', () => {
  it('starts logged out', () => {
    expect(useAuthStore.getState().user).toBeNull()
    expect(getAuthUser()).toBeNull()
  })

  it('login resolves the user and stores it', async () => {
    const user = await useAuthStore.getState().login('Ada Lovelace')
    expect(user).toMatchObject({ id: 'u1', name: 'Ada Lovelace' })
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('getAuthUser reads the same state outside React (what the loader guard uses)', async () => {
    await useAuthStore.getState().login('Grace Hopper')
    expect(getAuthUser()).toMatchObject({ name: 'Grace Hopper' })
  })

  it('logout clears the user', async () => {
    await useAuthStore.getState().login('Ada Lovelace')
    useAuthStore.getState().logout()
    expect(getAuthUser()).toBeNull()
  })
})
