// The message catalog: every user-facing string, keyed and flat. One file per
// locale. A translator (or a translation service) only ever touches these
// files — never a component.
export default {
  'nav.toggleTheme': 'Toggle theme',
  'nav.toggleLocale': 'Switch language',
  'nav.login': 'Log in',
  'nav.logout': 'Log out',

  'feed.title': 'Feed',
  'feed.loading': 'Loading feed…',
  'feed.empty': 'No posts yet.',

  'post.loading': 'Loading post…',
  'post.loadError': 'Could not load this post.',
  'post.notFound': 'Post not found.',
  'post.backToFeed': 'Back to feed',
  'post.back': '← Feed',

  'login.title': 'Log in',
  'login.hint': 'Try "Ada Lovelace" or any new name.',
  'login.namePlaceholder': 'Your name',
  'login.signingIn': 'Signing in…',
  'login.continue': 'Continue',
  'login.welcome': 'Welcome, {name}',

  'comments.title': 'Comments',
  'comments.loading': 'Loading comments…',
  'comments.empty': 'No comments yet.',
  'comments.loadError': 'Couldn’t load comments.',
  'comments.retry': 'Retry',
  'comments.loginPrompt': 'Log in to comment.',
  'comments.placeholder': 'Add a comment…',
  'comments.posting': 'Posting…',
  'comments.post': 'Post comment',
  'comments.posted': 'Comment posted',
  'comments.postFailed': 'Could not post comment',
  'comments.count.zero': 'No comments',
  'comments.count.one': '1 comment',
  'comments.count.other': '{count} comments',

  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.about': 'About',
  'settings.userId': 'User id:',
  'settings.currentTheme': 'Current theme:',

  'about.body': 'Devlog — a sandbox for exploring frontend architecture.',
  'about.note': 'This page only exists to show a second nested route.',

  'error.title': 'Something went wrong',
}
