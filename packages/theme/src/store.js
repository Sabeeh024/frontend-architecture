// Plain module, no React — same reasoning as devlog's localeStore (topic 09):
// this needs to be readable/writable before any component renders, and now
// also by more than one app. No Context can do that.
const KEY = 'theme'
const listeners = new Set()

function prefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function read() {
  try {
    return localStorage.getItem(KEY) ?? (prefersDark() ? 'dark' : 'light')
  } catch {
    return 'light'
  }
}

function apply(value) {
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = value
}

let theme = read()
apply(theme)

export function getTheme() {
  return theme
}

export function setTheme(value) {
  theme = value
  apply(theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private browsing / storage disabled */
  }
  listeners.forEach((fn) => fn(theme))
}

export function toggleTheme() {
  setTheme(theme === 'light' ? 'dark' : 'light')
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// The `storage` event is the browser's own cross-tab sync — it fires in
// OTHER tabs/windows when localStorage changes, but only within the SAME
// origin. Two tabs of apps/devlog: this fires, theme flips in both. A tab
// of apps/devlog and a tab of apps/admin, running on two different ports
// (two different origins): this NEVER fires between them, even though both
// import this exact package. Importing the same code twice does not create
// shared runtime state across an origin boundary — see NOTES/17.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue && e.newValue !== theme) {
      theme = e.newValue
      apply(theme)
      listeners.forEach((fn) => fn(theme))
    }
  })
}
