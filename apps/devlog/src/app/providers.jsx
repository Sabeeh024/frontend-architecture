import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'

// Down to one provider — auth was already a store (topic 06); theme moved to
// one too (topic 17, `@repo/theme`) so admin could reuse it without dragging
// a Context/Provider pair along. Stores don't need folding, they just don't
// nest here.
const providers = [[QueryClientProvider, { client: queryClient }]]

export function Providers({ children }) {
  return providers.reduceRight((tree, [P, props]) => <P {...props}>{tree}</P>, children)
}
