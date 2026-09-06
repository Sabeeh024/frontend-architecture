import { afterEach, describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../shared/theme/ThemeProvider'
import { useAuthStore } from '../features/auth'
import { makeQueryClient } from '../test/utils'
import { routes } from './router'

// Layer: routes + loaders + guards, wired together. createMemoryRouter over the
// SAME `routes` the app ships, driven from a starting URL.
afterEach(() => useAuthStore.setState({ user: null }))

function renderApp(initialEntry) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] })
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  )
  return router
}

describe('app routing', () => {
  it('renders the feed with data from the loader', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'On layered architecture' })).toBeInTheDocument()
  })

  it('the loader guard bounces /settings to /login when signed out', async () => {
    const router = renderApp('/settings')
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.search).toBe('?next=%2Fsettings')
  })

  it('lets a signed-in user reach /settings', async () => {
    useAuthStore.setState({ user: { id: 'u1', name: 'Ada Lovelace' } })
    renderApp('/settings')
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(await screen.findByText('User id:', { exact: false })).toBeInTheDocument()
  })

  it('shows the route errorElement for an unmatched path', async () => {
    renderApp('/does-not-exist')
    expect(await screen.findByText(/Back to feed/)).toBeInTheDocument()
  })
})
