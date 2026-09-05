import { NavLink, Outlet } from 'react-router-dom'

// A nested layout: renders inside RootLayout's <Outlet/>, and has its own
// <Outlet/> for its children. Two levels of shell, keyed to URL depth.
export function SettingsLayout() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <nav className="subnav">
        <NavLink to="/settings" end>Profile</NavLink>
        <NavLink to="/settings/about">About</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
