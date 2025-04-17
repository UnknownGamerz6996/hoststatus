// Main JavaScript file
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing application...")

  // First, initialize the servers from config
  initializeServers()

  // Then initialize the managers in the correct order
  initializeManagers()

  // Set up event listeners
  setupEventListeners()

  // Initialize tooltip functionality
  initTooltip()

  console.log("Application initialized successfully")
})

// Initialize servers from config
function initializeServers() {
  console.log("Initializing servers from config...")

  // Make sure the servers from config.js are available to StatusChecker
  if (typeof window.servers !== "undefined") {
    window.StatusChecker.setServers(window.servers)
  } else {
    console.error("Servers configuration not found!")
    // Fallback to default servers if config is missing
    window.StatusChecker.setServers([
      {
        id: "web-server",
        nameKey: "webServer",
        address: "185.88.31.15",
        checkInterval: 5000,
      },
      {
        id: "vps-server",
        nameKey: "vpsServer",
        address: "mc.hypixel.et",
        checkInterval: 5000,
      },
      {
        id: "api-server",
        nameKey: "apiServer",
        address: "api.example.com",
        checkInterval: 10000,
      },
    ])
  }
}

// Initialize all managers
function initializeManagers() {
  console.log("Initializing managers...")

  // Initialize theme first
  if (window.ThemeManager) {
    window.ThemeManager.init()
    console.log("Theme manager initialized")
  } else {
    console.error("Theme manager not found!")
  }

  // Initialize language next
  if (window.LanguageManager) {
    window.LanguageManager.init()
    console.log("Language manager initialized")
  } else {
    console.error("Language manager not found!")
  }

  // Initialize status checker last (depends on language manager)
  if (window.StatusChecker) {
    window.StatusChecker.init()
    console.log("Status checker initialized")
  } else {
    console.error("Status checker not found!")
  }
}

// Initialize tooltip
function initTooltip() {
  console.log("Initializing tooltip...")

  const tooltip = document.getElementById("tooltip")
  if (!tooltip) {
    console.error("Tooltip element not found!")
    return
  }

  // Add mousemove event to update tooltip position
  document.addEventListener("mousemove", (e) => {
    if (tooltip.classList.contains("hidden")) return

    const x = e.clientX
    const y = e.clientY

    // Position tooltip
    tooltip.style.left = `${x + 15}px`
    tooltip.style.top = `${y + 15}px`

    // Check if tooltip is out of viewport
    const rect = tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (rect.right > viewportWidth) {
      tooltip.style.left = `${x - rect.width - 15}px`
    }

    if (rect.bottom > viewportHeight) {
      tooltip.style.top = `${y - rect.height - 15}px`
    }
  })

  // Set up timeline block hover events
  setupTimelineHoverEvents()
}

// Set up timeline block hover events
function setupTimelineHoverEvents() {
  console.log("Setting up timeline hover events...")

  // We need to delegate these events since the blocks are created dynamically
  document.addEventListener("mouseover", (event) => {
    const tooltip = document.getElementById("tooltip")
    if (!tooltip) return

    // Check if the hovered element is a timeline block
    if (event.target.classList.contains("timeline-block") || event.target.closest(".timeline-block")) {
      const block = event.target.classList.contains("timeline-block")
        ? event.target
        : event.target.closest(".timeline-block")

      const serviceId = block.getAttribute("data-service-id")
      const pointIndex = Number.parseInt(block.getAttribute("data-point-index"))

      // Find service and history point
      const service = window.StatusChecker.getServices().find((s) => s.id === serviceId)
      if (!service || !service.history[pointIndex]) return

      const point = service.history[pointIndex]

      // Format tooltip content
      const formattedDate = window.LanguageManager.formatDate(point.timestamp)
      const formattedTime = window.LanguageManager.formatTime(point.timestamp)

      let statusIcon = ""
      if (point.status === "online") {
        statusIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--online))">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        `
      } else if (point.status === "maintenance") {
        statusIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--maintenance))">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        `
      } else {
        statusIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--offline))">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
          </svg>
        `
      }

      tooltip.innerHTML = `
        <div class="tooltip-content">
          <div class="tooltip-time">${formattedDate} - ${formattedTime}</div>
          <div class="tooltip-status">
            ${statusIcon}
            <span>${window.LanguageManager.t(point.status)}</span>
          </div>
          ${
            point.status !== "offline"
              ? `
            <div class="tooltip-response">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--muted-foreground))">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${point.responseTime} ms</span>
            </div>
          `
              : ""
          }
        </div>
        <div class="tooltip-arrow"></div>
      `

      tooltip.classList.remove("hidden")
    }
  })

  document.addEventListener("mouseout", (event) => {
    const tooltip = document.getElementById("tooltip")
    if (!tooltip) return

    if (event.target.classList.contains("timeline-block") || event.target.closest(".timeline-block")) {
      tooltip.classList.add("hidden")
    }
  })
}

// Set up event listeners
function setupEventListeners() {
  console.log("Setting up event listeners...")

  // Refresh button
  const refreshButton = document.getElementById("refresh-button")
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      console.log("Refresh button clicked")
      window.StatusChecker.refreshAllServices()
    })
  } else {
    console.error("Refresh button not found!")
  }

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      console.log("Theme toggle clicked")
      window.ThemeManager.toggleTheme()
    })
  } else {
    console.error("Theme toggle not found!")
  }

  // Language toggle
  const languageToggle = document.getElementById("language-toggle")
  const languageDropdown = document.getElementById("language-dropdown-menu")
  if (languageToggle && languageDropdown) {
    languageToggle.addEventListener("click", (e) => {
      console.log("Language toggle clicked")
      e.stopPropagation()
      languageDropdown.classList.toggle("hidden")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
        languageDropdown.classList.add("hidden")
      }
    })

    // Language options
    const languageOptions = document.querySelectorAll(".language-option")
    languageOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const lang = option.getAttribute("data-lang")
        console.log(`Language option clicked: ${lang}`)
        window.LanguageManager.setLanguage(lang)
        languageDropdown.classList.add("hidden")
      })
    })
  } else {
    console.error("Language toggle or dropdown not found!")
  }

  // Email subscription
  const updatesButton = document.getElementById("updates-button")
  const subscriptionModal = document.getElementById("subscription-modal")
  const modalClose = document.getElementById("modal-close")
  const modalOverlay = document.querySelector(".modal-overlay")
  const subscriptionForm = document.getElementById("subscription-form")

  if (updatesButton && subscriptionModal) {
    updatesButton.addEventListener("click", () => {
      console.log("Updates button clicked")
      subscriptionModal.classList.remove("hidden")
    })

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        console.log("Modal close clicked")
        subscriptionModal.classList.add("hidden")
      })
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", () => {
        console.log("Modal overlay clicked")
        subscriptionModal.classList.add("hidden")
      })
    }

    if (subscriptionForm) {
      subscriptionForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        console.log("Subscription form submitted")

        const emailInput = document.getElementById("email-input")
        if (!emailInput) return

        const email = emailInput.value.trim()
        if (!email) return

        // Disable form
        const subscribeButton = document.getElementById("subscribe-button")
        const subscribeText = document.getElementById("subscribe-text")

        if (subscribeButton) {
          subscribeButton.disabled = true
        }

        if (subscribeText) {
          subscribeText.textContent = window.LanguageManager.t("subscribing")
        }

        try {
          // Subscribe to updates
          const result = await window.StatusChecker.subscribeToUpdates(email)

          if (result.success) {
            // Show success message in the form
            const formMessage = document.createElement("div")
            formMessage.className = "form-message success"
            formMessage.textContent = window.LanguageManager.t("subscriptionThankYou")

            // Replace form with success message
            subscriptionForm.innerHTML = ""
            subscriptionForm.appendChild(formMessage)

            // Close modal after delay
            setTimeout(() => {
              subscriptionModal.classList.add("hidden")

              // Reset form for next time
              subscriptionForm.innerHTML = `
                <input type="email" id="email-input" class="email-input" placeholder="Enter your email" required>
                <button type="submit" id="subscribe-button" class="button button-primary">
                  <span id="subscribe-text">Subscribe</span>
                </button>
              `
            }, 3000)
          } else {
            // Show error in the form
            const formMessage = document.createElement("div")
            formMessage.className = "form-message error"
            formMessage.textContent = result.message

            // Add message to form
            const existingMessage = subscriptionForm.querySelector(".form-message")
            if (existingMessage) {
              existingMessage.replaceWith(formMessage)
            } else {
              subscriptionForm.appendChild(formMessage)
            }

            // Re-enable form
            if (subscribeButton) {
              subscribeButton.disabled = false
            }

            if (subscribeText) {
              subscribeText.textContent = window.LanguageManager.t("subscribe")
            }
          }
        } catch (error) {
          console.error("Error subscribing to updates:", error)

          // Show error in the form
          const formMessage = document.createElement("div")
          formMessage.className = "form-message error"
          formMessage.textContent = window.LanguageManager.t("subscriptionErrorMessage")

          // Add message to form
          const existingMessage = subscriptionForm.querySelector(".form-message")
          if (existingMessage) {
            existingMessage.replaceWith(formMessage)
          } else {
            subscriptionForm.appendChild(formMessage)
          }

          // Re-enable form
          if (subscribeButton) {
            subscribeButton.disabled = false
          }

          if (subscribeText) {
            subscribeText.textContent = window.LanguageManager.t("subscribe")
          }
        }
      })
    }
  } else {
    console.error("Updates button or subscription modal not found!")
  }
}

// Show form message (replaces toast notifications)
function showFormMessage(form, message, type = "success") {
  if (!form) return

  const messageElement = document.createElement("div")
  messageElement.className = `form-message ${type}`
  messageElement.textContent = message

  // Add message to form
  const existingMessage = form.querySelector(".form-message")
  if (existingMessage) {
    existingMessage.replaceWith(messageElement)
  } else {
    form.appendChild(messageElement)
  }

  // Auto-remove after delay
  setTimeout(() => {
    if (messageElement.parentNode === form) {
      messageElement.remove()
    }
  }, 5000)
}

// Make functions globally available
window.showFormMessage = showFormMessage
