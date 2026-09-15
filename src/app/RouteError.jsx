import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useT } from '../shared/i18n/t'

// One errorElement on the layout route catches render errors AND loader
// rejections for every screen below it. No try/catch in components.
export function RouteError() {
  const error = useRouteError()
  const t = useT()

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t('error.title')
  const detail = isRouteErrorResponse(error)
    ? error.data?.message
    : error?.message

  return (
    <div className="layout">
      <main>
        <h1>{title}</h1>
        {detail && <p className="muted">{detail}</p>}
        {/* Deliberately "/" (not locale-prefixed): this page can be showing
            because the :locale segment itself was invalid, so build a link
            off that same broken param — "/" re-resolves a real one. */}
        <p><Link to="/">← {t('post.backToFeed')}</Link></p>
      </main>
    </div>
  )
}
