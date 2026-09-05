import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'
import { ThemeProvider } from './theme/ThemeProvider'

// Only two providers now — auth became a store (no provider needed), which is
// half the point of stores for cross-cutting state. Fold the rest once.
const providers = [
  [QueryClientProvider, { client: queryClient }],
  [ThemeProvider],
]

export function Providers({ children }) {
  return providers.reduceRight((tree, [P, props]) => <P {...props}>{tree}</P>, children)
}
