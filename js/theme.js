// Theme module
const ThemeManager = (() => {
  // Current theme
  let isDark = true

  // Initialize theme from localStorage or system preference
  function init() {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem("theme")

    if (storedTheme) {
      // Use stored preference
      isDark = storedTheme === "dark"
      applyTheme()
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      isDark = prefersDark
      applyTheme()
    }
  }

  // Toggle theme
  function toggleTheme() {
    isDark = !isDark
    applyTheme()
    localStorage.setItem("theme", isDark ? "dark" : "light")
    return isDark
  }

  // Apply current theme
  function applyTheme() {
    if (isDark) {
      document.documentElement.classList.add("dark")
      updateThemeToggleIcon(true)
    } else {
      document.documentElement.classList.remove("dark")
      updateThemeToggleIcon(false)
    }
  }

  // Update theme toggle icon
  function updateThemeToggleIcon(isDark) {
    const themeToggle = document.getElementById("theme-toggle")
    if (!themeToggle) return

    if (isDark) {
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      `
    } else {
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      `
    }
  }

  // Public API
  return {
    init,
    toggleTheme,
    isDarkTheme: () => isDark,
  }
})()

// Initialize theme on load
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init()
})

// Make ThemeManager globally available
window.ThemeManager = ThemeManager
