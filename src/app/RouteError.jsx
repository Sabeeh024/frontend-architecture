import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

// One errorElement on the layout route catches render errors AND loader
// rejections for every screen below it. No try/catch in components.
export function RouteError() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'
  const detail = isRouteErrorResponse(error)
    ? error.data?.message
    : error?.message

  return (
    <div className="layout">
      <main>
        <h1>{title}</h1>
        {detail && <p className="muted">{detail}</p>}
        <p><Link to="/">← Back to feed</Link></p>
      </main>
    </div>
  )
}
