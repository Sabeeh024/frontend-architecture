// Feature flags: cross-cutting config, read from components AND non-React code
// (loaders, api layer). So it's a plain module, not Context — same reasoning as
// the auth store. In a real app the values come from an API / env / a service
// like LaunchDarkly; here they're static.
const flags = {
  reactions: true, // the 👍 bar on a post
  markdownComments: false, // not built — shows a flag gating unshipped work
}

export const isEnabled = (name) => flags[name] ?? false

// Hook form for symmetry with the rest of the app. If flags became dynamic
// (fetched, per-user), this is the one place that changes — swap to a store
// selector and every call site updates automatically.
export const useFlag = (name) => isEnabled(name)
