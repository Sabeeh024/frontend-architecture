// A real, small enhancement (topic 15): a `size` prop, additive and
// backwards-compatible — the changeset for this describes exactly this.
export function Button({ variant = 'primary', size = 'md', ...props }) {
  return <button className={`btn btn--${variant} btn--${size}`} {...props} />
}
