// Server configuration
// This configuration is loaded from PHP, but we keep this file for compatibility
// and to allow dynamic configuration in JavaScript

// Get server configuration from PHP
function loadServerConfig() {
// Check if there is an element with the ID 'server-config'
  const configElement = document.getElementById("server-config")
  if (configElement) {
    try {
      return JSON.parse(configElement.textContent)
    } catch (error) {
      console.error("Error parsing server configuration:", error)
    }
  }

// Default configuration in case we can't load from PHP
  return {
    DEFAULT_CHECK_INTERVAL: 5000,
    DEFAULT_TIMEOUT: 3000,
    servers: [
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
      {
        id: "database",
        nameKey: "database",
        address: "db.example.com",
        checkInterval: 15000,
      },
      {
        id: "storage",
        nameKey: "storage",
        address: "storage.example.com",
        checkInterval: 20000,
      },
    ],
  }
}

// Export the configuration for use in other files
window.servers = loadServerConfig().servers
window.DEFAULT_CHECK_INTERVAL = loadServerConfig().DEFAULT_CHECK_INTERVAL
window.DEFAULT_TIMEOUT = loadServerConfig().DEFAULT_TIMEOUT
