// Generic: takes a name, draws initials. No domain knowledge -> lives in shared.
export function Avatar({ name }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  return <span className="avatar" aria-hidden="true">{initials}</span>
}
