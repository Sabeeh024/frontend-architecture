import { NavLink, Outlet } from 'react-router-dom'
import { useT } from '../../shared/i18n/t'

// A nested layout: renders inside RootLayout's <Outlet/>, and has its own
// <Outlet/> for its children. Two levels of shell, keyed to URL depth.
export function SettingsLayout() {
  const t = useT()
  return (
    <div className="settings">
      <h1>{t('settings.title')}</h1>
      <nav className="subnav">
        <NavLink to="/settings" end>{t('settings.profile')}</NavLink>
        <NavLink to="/settings/about">{t('settings.about')}</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
