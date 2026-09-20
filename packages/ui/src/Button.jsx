// topic 14 demo: a package change, every dependent app should show as affected.
export function Button({ variant = 'primary', ...props }) {
  return <button className={`btn btn--${variant}`} {...props} />
}
