// Dark mode has been removed from this project.
// All components now use light mode only.

export function ThemeProvider({ children }) {
  return children
}

export function useTheme() {
  return { darkMode: false }
}