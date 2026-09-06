import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'

// A fresh QueryClient per test = no cache bleed between tests. retry:false so a
// failing query fails fast instead of retrying for seconds.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

// Render a component with the providers most of the app assumes exist.
export function renderWithProviders(ui, { route = '/', client = makeQueryClient() } = {}) {
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}
