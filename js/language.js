// Language module
const LanguageManager = (() => {
  // Available languages
  const languages = {
    en: {
      // Page title and header
      pageTitle: "System Status",
      pageSubtitle: "Zero Lag Hosting Server Monitoring",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      getUpdates: "Get Updates",

      // Status overview
      allSystemsOperational: "All Systems Operational",
      systemDisruptionDetected: "System Disruption Detected",
      allServicesRunning: "All services are running smoothly.",
      someServicesIssues: "We're currently experiencing issues with some services.",

      // Service table
      serviceColumnTitle: "Service",
      statusColumnTitle: "Status",
      uptimeColumnTitle: "Uptime",
      responseTimeColumnTitle: "Response Time",
      lastCheckedColumnTitle: "Last Checked",

      // Service statuses
      online: "Online",
      offline: "Offline",
      maintenance: "Maintenance",

      // Service names
      webServer: "Web Server",
      vpsServer: "VPS Server",
      apiServer: "API Server",
      database: "Database",
      storage: "Storage",

      // Uptime graph
      uptimeTitle: "Service Status Timeline",
      uptimeSubtitle: "Last 24 hours of service performance",

      // Email subscription
      getUpdatesTitle: "Get Email Updates",
      getUpdatesDescription:
        "Stay informed about our system status. We'll send you updates when there are changes or planned maintenance.",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
      subscribing: "Subscribing...",
      subscriptionSuccess: "Subscription Successful",
      subscriptionError: "Subscription Failed",
      subscriptionErrorMessage: "Failed to subscribe. Please try again later.",
      subscriptionThankYou: "Thank you for subscribing!",

      // Footer
      lastUpdated: "Last updated",
      copyright: "© 2025 ZeroLag Hosting. All rights reserved.",

      // Languages
      english: "English",
      romanian: "Romanian",
    },
    ro: {
      // Page title and header
      pageTitle: "Stare Sistem",
      pageSubtitle: "Monitorizare server de găzduire Zero Lag",
      refresh: "Reîmprospătare",
      refreshing: "Se reîmprospătează...",
      getUpdates: "Primește Actualizări",

      // Status overview
      allSystemsOperational: "Toate Sistemele Funcționează",
      systemDisruptionDetected: "Întrerupere Sistem Detectată",
      allServicesRunning: "Toate serviciile funcționează normal.",
      someServicesIssues: "Întâmpinăm probleme cu unele servicii.",

      // Service table
      serviceColumnTitle: "Serviciu",
      statusColumnTitle: "Stare",
      uptimeColumnTitle: "Timp de funcționare",
      responseTimeColumnTitle: "Timp de răspuns",
      lastCheckedColumnTitle: "Ultima verificare",

      // Service statuses
      online: "Funcțional",
      offline: "Nefuncțional",
      maintenance: "Mentenanță",

      // Service names
      webServer: "Server Web",
      vpsServer: "Server VPS",
      apiServer: "Server API",
      database: "Bază de Date",
      storage: "Stocare",

      // Uptime graph
      uptimeTitle: "Cronologie Stare Servicii",
      uptimeSubtitle: "Ultimele 24 de ore de performanță a serviciilor",

      // Email subscription
      getUpdatesTitle: "Primește Actualizări pe Email",
      getUpdatesDescription:
        "Fii informat despre starea sistemului nostru. Îți vom trimite actualizări când apar schimbări sau mentenanță planificată.",
      emailPlaceholder: "Introdu adresa de email",
      subscribe: "Abonează-te",
      subscribing: "Se procesează...",
      subscriptionSuccess: "Abonare Reușită",
      subscriptionError: "Abonare Eșuată",
      subscriptionErrorMessage: "Nu s-a putut realiza abonarea. Te rugăm să încerci din nou mai târziu.",
      subscriptionThankYou: "Îți mulțumim pentru abonare!",

      // Footer
      lastUpdated: "Ultima actualizare",
      copyright: "© 2025 ZeroLag HOsting. Toate drepturile rezervate.",

      // Languages
      english: "Engleză",
      romanian: "Română",
    },
  }

  // Current language
  let currentLanguage = "en"

  // Initialize language from localStorage or browser language
  function init() {
    const storedLanguage = localStorage.getItem("language")

    if (storedLanguage && (storedLanguage === "en" || storedLanguage === "ro")) {
      currentLanguage = storedLanguage
    } else {
      // Check browser language
      const browserLanguage = navigator.language.split("-")[0]
      if (browserLanguage === "ro") {
        currentLanguage = "ro"
      }
    }

    // Update UI
    updateLanguageUI()
  }

  // Set language
  function setLanguage(language) {
    if (languages[language]) {
      currentLanguage = language
      localStorage.setItem("language", language)
      updateLanguageUI()
      return true
    }
    return false
  }

  // Get translation
  function t(key) {
    return languages[currentLanguage][key] || key
  }

  // Update UI with current language
  function updateLanguageUI() {
    // Update language options
    const languageOptions = document.querySelectorAll(".language-option")
    languageOptions.forEach((option) => {
      const lang = option.getAttribute("data-lang")
      if (lang === currentLanguage) {
        option.classList.add("active")
      } else {
        option.classList.remove("active")
      }
    })

    // Update page title and subtitle
    document.getElementById("page-title").textContent = t("pageTitle")
    document.getElementById("page-subtitle").textContent = t("pageSubtitle")

    // Update buttons
    document.getElementById("refresh-text").textContent = t("refresh")
    document.getElementById("updates-text").textContent = t("getUpdates")

    // Update status overview
    updateStatusOverview()

    // Update table headers
    document.getElementById("service-column").textContent = t("serviceColumnTitle")
    document.getElementById("status-column").textContent = t("statusColumnTitle")
    document.getElementById("uptime-column").textContent = t("uptimeColumnTitle")
    document.getElementById("response-column").textContent = t("responseTimeColumnTitle")
    document.getElementById("checked-column").textContent = t("lastCheckedColumnTitle")

    // Update uptime section
    document.getElementById("uptime-title").textContent = t("uptimeTitle")
    document.getElementById("uptime-subtitle").textContent = t("uptimeSubtitle")

    // Update modal
    document.getElementById("modal-title").textContent = t("getUpdatesTitle")
    document.getElementById("modal-description").textContent = t("getUpdatesDescription")
    document.getElementById("email-input").placeholder = t("emailPlaceholder")
    document.getElementById("subscribe-text").textContent = t("subscribe")

    // Update last updated text
    document.getElementById("last-updated-text").textContent = t("lastUpdated")

    // Update copyright
    document.getElementById("copyright").textContent = t("copyright")

    // Update service table and uptime graph
    updateServiceTable()
    updateUptimeGraph()
  }

  // Update status overview based on services
  function updateStatusOverview() {
    const statusTitle = document.getElementById("status-title")
    const statusMessage = document.getElementById("status-message")
    const statusIcon = document.getElementById("status-icon")

    // Get services from StatusChecker
    const services = window.StatusChecker ? window.StatusChecker.getServices() : []

    // Check if all services are operational
    const allOperational = services.length > 0 && services.every((service) => service.status === "online")

    if (allOperational) {
      statusTitle.textContent = t("allSystemsOperational")
      statusMessage.textContent = t("allServicesRunning")
      statusIcon.className = "status-icon status-icon-operational"
      statusIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `
    } else {
      statusTitle.textContent = t("systemDisruptionDetected")
      statusMessage.textContent = t("someServicesIssues")
      statusIcon.className = "status-icon status-icon-disruption"
      statusIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `
    }
  }

  // Update service table with translated content
  function updateServiceTable() {
    const tableBody = document.getElementById("service-table-body")
    if (!tableBody) return

    // Get services from StatusChecker
    const services = window.StatusChecker ? window.StatusChecker.getServices() : []

    // Clear existing rows
    tableBody.innerHTML = ""

    // Add rows for each service
    services.forEach((service) => {
      const row = document.createElement("tr")

      // Service name
      const nameCell = document.createElement("td")
      nameCell.textContent = t(service.nameKey)
      row.appendChild(nameCell)

      // Status
      const statusCell = document.createElement("td")
      const statusDiv = document.createElement("div")
      statusDiv.className = "service-status"

      const statusIndicator = document.createElement("div")
      statusIndicator.className = `status-indicator status-${service.status}`
      statusDiv.appendChild(statusIndicator)

      const statusText = document.createElement("span")
      statusText.textContent = t(service.status)
      statusDiv.appendChild(statusText)

      // Add badge for offline or maintenance
      if (service.status === "offline" && service.currentDowntimeDuration > 0) {
        const badge = document.createElement("span")
        badge.className = "status-badge status-badge-offline"
        badge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${window.StatusChecker.formatDuration(service.currentDowntimeDuration)}
        `
        statusDiv.appendChild(badge)
      } else if (service.status === "maintenance") {
        const badge = document.createElement("span")
        badge.className = "status-badge status-badge-maintenance"
        badge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0   class="icon">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          ${t("maintenance")}
        `
        statusDiv.appendChild(badge)
      }

      statusCell.appendChild(statusDiv)
      row.appendChild(statusCell)

      // Uptime
      const uptimeCell = document.createElement("td")
      const uptimeDiv = document.createElement("div")
      uptimeDiv.className = "service-uptime"
      uptimeDiv.style.display = "flex"
      uptimeDiv.style.alignItems = "center"

      const uptimeBar = document.createElement("div")
      uptimeBar.className = "uptime-bar"

      const uptimeProgress = document.createElement("div")
      uptimeProgress.className = "uptime-progress"
      if (service.uptime > 99) {
        uptimeProgress.classList.add("uptime-high")
      } else if (service.uptime > 95) {
        uptimeProgress.classList.add("uptime-medium")
      } else {
        uptimeProgress.classList.add("uptime-low")
      }
      uptimeProgress.style.width = `${Math.min(100, service.uptime)}%`
      uptimeBar.appendChild(uptimeProgress)
      uptimeDiv.appendChild(uptimeBar)

      const uptimeText = document.createElement("span")
      uptimeText.textContent = `${service.uptime.toFixed(2)}%`
      uptimeDiv.appendChild(uptimeText)

      uptimeCell.appendChild(uptimeDiv)
      row.appendChild(uptimeCell)

      // Response time
      const responseCell = document.createElement("td")
      if (service.status === "offline") {
        responseCell.innerHTML = '<span class="response-time" style="color: hsl(var(--offline));">—</span>'
      } else {
        const responseClass = service.responseTime > 100 ? "response-time-medium" : "response-time-fast"
        responseCell.innerHTML = `<span class="response-time ${responseClass}">${service.responseTime} ms</span>`
      }
      row.appendChild(responseCell)

      // Last checked
      const checkedCell = document.createElement("td")
      checkedCell.className = "last-checked"
      checkedCell.textContent = new Date(service.lastChecked).toLocaleTimeString()
      row.appendChild(checkedCell)

      tableBody.appendChild(row)
    })
  }

  // Update uptime graph with translated content
  function updateUptimeGraph() {
    const serviceFilters = document.getElementById("service-filters")
    const serviceTimelines = document.getElementById("service-timelines")
    if (!serviceFilters || !serviceTimelines) return

    // Get services from StatusChecker
    const services = window.StatusChecker ? window.StatusChecker.getServices() : []

    // Clear existing content
    serviceFilters.innerHTML = ""
    serviceTimelines.innerHTML = ""

    // Add service filters
    services.forEach((service) => {
      const filter = document.createElement("div")
      filter.className = "service-filter"

      const indicator = document.createElement("div")
      indicator.className = `service-filter-indicator status-${service.status}`
      filter.appendChild(indicator)

      const name = document.createElement("span")
      name.textContent = t(service.nameKey)
      filter.appendChild(name)

      serviceFilters.appendChild(filter)
    })

    // Add service timelines
    services.forEach((service) => {
      const timeline = document.createElement("div")
      timeline.className = "service-timeline"

      // Timeline header
      const header = document.createElement("div")
      header.className = "timeline-header"

      const serviceInfo = document.createElement("div")
      serviceInfo.className = "timeline-service"

      const serviceIndicator = document.createElement("div")
      serviceIndicator.className = `status-indicator status-${service.status}`
      serviceInfo.appendChild(serviceIndicator)

      const serviceName = document.createElement("span")
      serviceName.textContent = t(service.nameKey)
      serviceInfo.appendChild(serviceName)

      header.appendChild(serviceInfo)

      const responseInfo = document.createElement("div")
      responseInfo.className = "timeline-response"

      const clockIcon = document.createElement("span")
      clockIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `
      responseInfo.appendChild(clockIcon)

      const responseText = document.createElement("span")
      responseText.textContent = service.status === "offline" ? "—" : `${service.responseTime} ms`
      responseInfo.appendChild(responseText)

      header.appendChild(responseInfo)
      timeline.appendChild(header)

      // Timeline chart
      const chart = document.createElement("div")
      chart.className = "timeline-chart"

      // Timeline markers
      const markers = document.createElement("div")
      markers.className = "timeline-markers"

      for (let i = 0; i < 6; i++) {
        const marker = document.createElement("div")
        marker.className = "timeline-marker"
        markers.appendChild(marker)
      }

      chart.appendChild(markers)

      // Timeline blocks
      const blocks = document.createElement("div")
      blocks.className = "timeline-blocks"

      service.history.forEach((point, index) => {
        const block = document.createElement("div")
        block.className = "timeline-block"
        block.style.width = `${100 / service.history.length}%`
        block.setAttribute("data-service-id", service.id)
        block.setAttribute("data-point-index", index)

        const bg = document.createElement("div")
        bg.className = `timeline-block-bg status-${point.status}`
        block.appendChild(bg)

        const indicator = document.createElement("div")
        indicator.className = `timeline-block-indicator status-${point.status}`
        block.appendChild(indicator)

        blocks.appendChild(block)
      })

      chart.appendChild(blocks)
      timeline.appendChild(chart)

      // Timeline labels
      const labels = document.createElement("div")
      labels.className = "timeline-labels"

      for (let i = 0; i < 6; i++) {
        const hoursAgo = 24 - i * 4
        const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
        const label = document.createElement("div")
        label.textContent = formatTime(date)
        labels.appendChild(label)
      }

      const nowLabel = document.createElement("div")
      nowLabel.textContent = "Now"
      labels.appendChild(nowLabel)

      timeline.appendChild(labels)
      serviceTimelines.appendChild(timeline)
    })
  }

  // Format time helper
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date helper
  function formatDate(date) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Public API
  return {
    init,
    setLanguage,
    t,
    updateLanguageUI,
    updateStatusOverview,
    updateServiceTable,
    updateUptimeGraph,
    getCurrentLanguage: () => currentLanguage,
    formatTime,
    formatDate,
  }
})()

// Initialize language on load
document.addEventListener("DOMContentLoaded", () => {
  LanguageManager.init()
})

// Make LanguageManager globally available
window.LanguageManager = LanguageManager
