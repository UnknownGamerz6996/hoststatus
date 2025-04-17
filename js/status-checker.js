// Status Checker module
const StatusChecker = (() => {
  // Default values for check interval and timeout
  const DEFAULT_CHECK_INTERVAL = window.DEFAULT_CHECK_INTERVAL || 5000 // 5 seconds
  const DEFAULT_TIMEOUT = window.DEFAULT_TIMEOUT || 3000 // 3 seconds

  // Status change confirmation threshold (number of consecutive checks needed to confirm a status change)
  const STATUS_CHANGE_THRESHOLD = 3

  // Servers configuration
  let servers = []

  // Services data
  let services = []

  // Intervals for checking services
  let intervals = []

  // Last updated timestamp
  let lastUpdated = new Date()

  // Is refreshing flag
  let isRefreshing = false

  // Set servers configuration
  function setServers(serverConfig) {
    console.log("Setting servers configuration:", serverConfig)
    servers = serverConfig
  }

  // Initialize services from config
  function init() {
    console.log("Initializing StatusChecker with servers:", servers)

    // Clear any existing intervals
    clearAllIntervals()

    // Initialize services with default data
    services = servers.map((server) => initializeServerData(server))
    console.log("Initialized services:", services)

    // Perform initial status checks
    refreshAllServices().then(() => {
      // Set up check intervals for each server
      setupCheckIntervals()

      // Update UI
      updateUI()
    })
  }

  // Initialize server data from config
  function initializeServerData(config) {
    // Determine initial status
    const initialStatus = "unknown" // Start with unknown status until confirmed
    const uptimePercentage = 100.0

    return {
      id: config.id,
      nameKey: config.nameKey,
      address: config.address,
      status: initialStatus,
      uptime: uptimePercentage,
      responseTime: 0,
      lastChecked: new Date(),
      history: generateHistory(uptimePercentage, "online"), // Default history
      checkCount: 0,
      successCount: 0,
      lastDowntime: null,
      currentDowntimeDuration: 0,
      downtimeHistory: [],
      // Status stability tracking
      pendingStatus: null,
      pendingStatusCount: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    }
  }

  // Generate initial history data for a server
  function generateHistory(onlinePercentage, currentStatus) {
    const history = []
    const now = new Date()

    // Generate data points for the last 24 hours (one per hour)
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)

      // Randomly determine status based on the online percentage
      let status
      const random = Math.random() * 100

      if (i === 0) {
        // Current status
        status = currentStatus
      } else if (random < onlinePercentage) {
        status = "online"
      } else if (random < onlinePercentage + (100 - onlinePercentage) / 2) {
        status = "maintenance"
      } else {
        status = "offline"
      }

      // Generate a realistic response time
      let responseTime = 0
      if (status === "online") {
        responseTime = Math.floor(Math.random() * 60) + 30
      } else if (status === "maintenance") {
        responseTime = Math.floor(Math.random() * 100) + 100
      } else {
        responseTime = 0
      }

      history.push({ timestamp, status, responseTime })
    }

    return history
  }

  // Set up check intervals for each server
  function setupCheckIntervals() {
    console.log("Setting up check intervals for servers")

    // Clear any existing intervals
    clearAllIntervals()

    // Set up an interval for each server
    servers.forEach((serverConfig, index) => {
      const checkInterval = serverConfig.checkInterval || DEFAULT_CHECK_INTERVAL
      const port = serverConfig.port || 80

      const intervalId = setInterval(async () => {
        // Get the current service data
        const service = services[index]
        if (!service) return

        // Check the server status
        const checkResult = await checkServerStatus(service.address, serverConfig.timeout, port)

        // Update the service data with stability checks
        updateServiceStatusWithStability(index, checkResult)

        // Update last updated timestamp
        lastUpdated = new Date()

        // Update UI
        updateUI()
      }, checkInterval)

      intervals.push(intervalId)
    })
  }

  // Clear all check intervals
  function clearAllIntervals() {
    intervals.forEach((interval) => clearInterval(interval))
    intervals = []
  }

  // Refresh all services
  async function refreshAllServices() {
    if (isRefreshing) return

    console.log("Refreshing all services")
    isRefreshing = true

    // Update UI to show refreshing state
    const refreshButton = document.getElementById("refresh-button")
    if (refreshButton) {
      const refreshText = document.getElementById("refresh-text")
      if (refreshText) {
        refreshText.textContent = window.LanguageManager ? window.LanguageManager.t("refreshing") : "Refreshing..."
      }
      refreshButton.disabled = true

      // Add spinning animation to refresh icon
      const refreshIcon = refreshButton.querySelector("svg")
      if (refreshIcon) {
        refreshIcon.classList.add("spin")
      }
    }

    try {
      // Check each service
      await Promise.all(
        services.map(async (service, index) => {
          const serverConfig = servers[index]
          const port = serverConfig.port || 80
          const checkResult = await checkServerStatus(service.address, serverConfig.timeout, port)

          // Update service status with stability checks
          updateServiceStatusWithStability(index, checkResult)
        }),
      )

      // Update last updated timestamp
      lastUpdated = new Date()

      // Update UI
      updateUI()
    } catch (error) {
      console.error("Error refreshing services:", error)
    } finally {
      isRefreshing = false

      // Update UI to show normal state
      if (refreshButton) {
        const refreshText = document.getElementById("refresh-text")
        if (refreshText) {
          refreshText.textContent = window.LanguageManager ? window.LanguageManager.t("refresh") : "Refresh"
        }
        refreshButton.disabled = false

        // Remove spinning animation from refresh icon
        const refreshIcon = refreshButton.querySelector("svg")
        if (refreshIcon) {
          refreshIcon.classList.remove("spin")
        }
      }
    }
  }

  // Update service status with stability checks
  function updateServiceStatusWithStability(index, checkResult) {
    // Get the current service
    const service = services[index]
    if (!service) return

    // Update consecutive success/failure counts
    if (checkResult.status === "online") {
      service.consecutiveSuccesses++
      service.consecutiveFailures = 0
    } else {
      service.consecutiveFailures++
      service.consecutiveSuccesses = 0
    }

    // Check if the result differs from current status
    if (service.status !== checkResult.status) {
      // If this is a new pending status or different from the current pending status
      if (service.pendingStatus !== checkResult.status) {
        service.pendingStatus = checkResult.status
        service.pendingStatusCount = 1
      } else {
        // Increment the counter for this pending status
        service.pendingStatusCount++

        // If we've reached the threshold, actually change the status
        if (service.pendingStatusCount >= STATUS_CHANGE_THRESHOLD) {
          // Status change confirmed - update the actual status
          const oldStatus = service.status

          // Update downtime tracking
          let lastDowntime = service.lastDowntime
          let currentDowntimeDuration = service.currentDowntimeDuration
          const downtimeHistory = [...service.downtimeHistory]

          if (checkResult.status === "offline" && oldStatus !== "offline" && oldStatus !== "unknown") {
            // Server just went down
            lastDowntime = new Date()
            currentDowntimeDuration = 0
          } else if (checkResult.status === "offline" && oldStatus === "offline") {
            // Server still down, update duration
            currentDowntimeDuration = calculateDowntimeDuration(service.lastDowntime)
          } else if (checkResult.status !== "offline" && oldStatus === "offline") {
            // Server just came back up, record the downtime event
            const endTime = new Date()
            const duration = calculateDowntimeDuration(service.lastDowntime)

            if (service.lastDowntime) {
              downtimeHistory.push({
                startTime: service.lastDowntime,
                endTime,
                duration,
                reason: null,
              })
            }

            lastDowntime = null
            currentDowntimeDuration = 0
          }

          // Update history with new status
          const newHistory = [...service.history]
          newHistory.shift() // Remove oldest point
          newHistory.push({
            timestamp: new Date(),
            status: checkResult.status,
            responseTime: checkResult.responseTime,
          })

          // Increment check count
          const newCheckCount = service.checkCount + 1

          // Increment success count if online
          const newSuccessCount = checkResult.status === "online" ? service.successCount + 1 : service.successCount

          // Calculate accurate uptime percentage
          const uptimePercentage = (newSuccessCount / newCheckCount) * 100

          // Update the service
          services[index] = {
            ...service,
            status: checkResult.status,
            responseTime: checkResult.status !== "offline" ? checkResult.responseTime : 0,
            lastChecked: new Date(),
            history: newHistory,
            checkCount: newCheckCount,
            successCount: newSuccessCount,
            uptime: uptimePercentage,
            lastDowntime,
            currentDowntimeDuration,
            downtimeHistory,
            // Reset pending status tracking
            pendingStatus: null,
            pendingStatusCount: 0,
          }

          console.log(
            `Status change confirmed for ${service.nameKey}: ${oldStatus} -> ${checkResult.status} after ${STATUS_CHANGE_THRESHOLD} consecutive checks`,
          )
        } else {
          console.log(
            `Pending status change for ${service.nameKey}: ${service.status} -> ${checkResult.status} (${service.pendingStatusCount}/${STATUS_CHANGE_THRESHOLD})`,
          )

          // Just update the last checked time
          services[index] = {
            ...service,
            lastChecked: new Date(),
          }
        }
      }
    } else {
      // Status matches current status, reset pending status
      services[index] = {
        ...service,
        pendingStatus: null,
        pendingStatusCount: 0,
        lastChecked: new Date(),
        responseTime: checkResult.status !== "offline" ? checkResult.responseTime : service.responseTime,
      }
    }
  }

  // Check server status
  async function checkServerStatus(address, timeout = DEFAULT_TIMEOUT, port = 80) {
    try {
      // În implementarea reală, vom face un apel către API-ul PHP
      const apiUrl = `api/check-status.php?address=${encodeURIComponent(address)}&timeout=${timeout}&port=${port}`

      console.log(`Checking status for ${address}:${port}...`)

      const response = await fetch(apiUrl)
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`)
        return { status: "offline", responseTime: 0 }
      }

      const result = await response.json()
      console.log(`Status for ${address}:${port}: ${result.status}, response time: ${result.responseTime}ms`)
      return result
    } catch (error) {
      console.error(`Error checking server status for ${address}:${port}:`, error)
      return { status: "offline", responseTime: 0 }
    }
  }

  // Calculate downtime duration
  function calculateDowntimeDuration(startTime) {
    if (!startTime) return 0

    const now = new Date()
    const durationMs = now.getTime() - startTime.getTime()
    return Math.floor(durationMs / 1000) // Convert to seconds
  }

  // Format duration in human-readable format
  function formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds} seconds`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes > 0 ? `${minutes} min` : ""}`
    } else {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      return `${days} day${days !== 1 ? "s" : ""} ${hours > 0 ? `${hours} hr` : ""}`
    }
  }

  // Update UI
  function updateUI() {
    // Update last updated time
    const lastUpdatedTime = document.getElementById("last-updated-time")
    if (lastUpdatedTime) {
      lastUpdatedTime.textContent = lastUpdated.toLocaleTimeString()
    }

    // Update status overview
    if (window.LanguageManager) {
      window.LanguageManager.updateStatusOverview()
      window.LanguageManager.updateServiceTable()
      window.LanguageManager.updateUptimeGraph()
    }
  }

  // Subscribe to email updates
  function subscribeToUpdates(email) {
    return new Promise(async (resolve, reject) => {
      try {
        // Folosim FormData pentru a trimite datele către API-ul PHP
        const formData = new FormData()
        formData.append("email", email)

        const response = await fetch("api/subscribe.php", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        resolve(result)
      } catch (error) {
        console.error("Error subscribing to updates:", error)
        reject({
          success: false,
          message: "Failed to subscribe. Please try again later.",
        })
      }
    })
  }

  // Public API
  return {
    init,
    setServers,
    refreshAllServices,
    getServices: () => services,
    getLastUpdated: () => lastUpdated,
    isRefreshing: () => isRefreshing,
    formatDuration,
    subscribeToUpdates,
  }
})()

// Make StatusChecker globally available
window.StatusChecker = StatusChecker
