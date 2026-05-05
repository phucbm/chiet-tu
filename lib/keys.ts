export const isSearchShortcut = (e: KeyboardEvent) =>
  (e.ctrlKey || e.metaKey) && e.key === 'k'
