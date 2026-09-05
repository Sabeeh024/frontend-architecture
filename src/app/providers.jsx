import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'
import { ThemeProvider } from './theme/ThemeProvider'
import { AuthProvider } from '../features/auth'

// "Provider hell" fix: list the providers, fold them once. Reads top-to-bottom
// as outermost-to-innermost. None of these need the router, so they wrap it.
const providers = [
  [QueryClientProvider, { client: queryClient }],
  [ThemeProvider],
  [AuthProvider],
]

export function Providers({ children }) {
  return providers.reduceRight(
    (tree, [P, props]) => <P {...props}>{tree}</P>,
    children,
  )
}
