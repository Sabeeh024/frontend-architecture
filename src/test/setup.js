import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetDb } from '../shared/api/client'
import { useLocaleStore } from '../shared/i18n/localeStore'

// Every test starts from the same fixture: unmount the tree, reset the fake
// DB, reset the locale (a test that switches language shouldn't leak it).
afterEach(() => {
  cleanup()
  resetDb()
  useLocaleStore.setState({ locale: 'en' })
})
