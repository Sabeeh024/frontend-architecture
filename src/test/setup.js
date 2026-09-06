import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetDb } from '../shared/api/client'

// Every test starts from the same fixture: unmount the tree, reset the fake DB.
afterEach(() => {
  cleanup()
  resetDb()
})
