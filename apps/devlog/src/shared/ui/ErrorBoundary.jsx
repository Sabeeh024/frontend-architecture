import { Component } from 'react'

// The route's errorElement is the *coarsest* boundary — one render error and
// the whole screen is replaced. This is a fine-grained one: wrap a single
// widget so a failure there doesn't take down the page around it.
// (Still a class — React has no hook equivalent for componentDidCatch yet.)
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // real app: report to Sentry/etc.
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      const fb = this.props.fallback
      return typeof fb === 'function' ? fb(this.state.error, this.reset) : (fb ?? null)
    }
    return this.props.children
  }
}
