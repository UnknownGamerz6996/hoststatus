<?php
// Initial configuration
$config = include 'config/servers.php';
$translations = include 'config/translations.php';

// Get the preferred language
$language = isset($_COOKIE['language']) ? $_COOKIE['language'] : 'en';
if (!array_key_exists($language, $translations)) {
    $language = 'en';
}

// Function for translation
function t($key, $lang, $translations) {
    return isset($translations[$lang][$key]) ? $translations[$lang][$key] : $key;
}
?>
<!DOCTYPE html>
<html lang="<?php echo $language; ?>" class="<?php echo isset($_COOKIE['theme']) && $_COOKIE['theme'] === 'light' ? '' : 'dark'; ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo t('pageTitle', $language, $translations); ?> | <?php echo t('monitoringSystem', $language, $translations); ?></title>
  <meta name="description" content="<?php echo t('pageDescription', $language, $translations); ?>">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app">
    <div class="container">
      <header class="header">
        <h1 id="page-title"><?php echo t('pageTitle', $language, $translations); ?></h1>
        <p id="page-subtitle" class="subtitle"><?php echo t('pageSubtitle', $language, $translations); ?></p>
        
        <div class="header-actions">
          <button id="refresh-button" class="button button-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            <span id="refresh-text"><?php echo t('refresh', $language, $translations); ?></span>
          </button>
          <button id="updates-button" class="button button-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <span id="updates-text"><?php echo t('getUpdates', $language, $translations); ?></span>
          </button>
          <p class="last-updated">
            <span id="last-updated-text"><?php echo t('lastUpdated', $language, $translations); ?></span>: <span id="last-updated-time"></span>
          </p>
        </div>
      </header>

      <div id="status-overview" class="card status-overview">
        <div id="status-icon" class="status-icon status-icon-operational">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 id="status-title" class="status-title"><?php echo t('allSystemsOperational', $language, $translations); ?></h2>
        <p id="status-message" class="status-message"><?php echo t('allServicesRunning', $language, $translations); ?></p>
      </div>

      <div class="service-table-container">
        <div class="card">
          <table id="service-table" class="service-table">
            <thead>
              <tr>
                <th id="service-column"><?php echo t('serviceColumnTitle', $language, $translations); ?></th>
                <th id="status-column"><?php echo t('statusColumnTitle', $language, $translations); ?></th>
                <th id="uptime-column"><?php echo t('uptimeColumnTitle', $language, $translations); ?></th>
                <th id="response-column"><?php echo t('responseTimeColumnTitle', $language, $translations); ?></th>
                <th id="checked-column"><?php echo t('lastCheckedColumnTitle', $language, $translations); ?></th>
              </tr>
            </thead>
            <tbody id="service-table-body">
              <!-- Services will be added here dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <div class="uptime-section">
        <div class="uptime-header">
          <h2 id="uptime-title" class="section-title"><?php echo t('uptimeTitle', $language, $translations); ?></h2>
          <p id="uptime-subtitle" class="section-subtitle"><?php echo t('uptimeSubtitle', $language, $translations); ?></p>
        </div>
        <div id="uptime-graph" class="card uptime-graph">
          <div id="service-filters" class="service-filters">
            <!-- Service filters will be added here dynamically -->
          </div>
          <div id="service-timelines" class="service-timelines">
            <!-- Service timelines will be added here dynamically -->
          </div>
        </div>
      </div>

      <footer class="footer">
        <div class="footer-actions">
          <button id="theme-toggle" class="icon-button" aria-label="Toggle theme">
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
          </button>
          <div class="language-dropdown">
            <button id="language-toggle" class="icon-button" aria-label="Change language">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                <path d="M2 12h20"></path>
              </svg>
            </button>
            <div id="language-dropdown-menu" class="language-dropdown-menu hidden">
              <button data-lang="en" class="language-option <?php echo $language === 'en' ? 'active' : ''; ?>">English</button>
              <button data-lang="ro" class="language-option <?php echo $language === 'ro' ? 'active' : ''; ?>">Romanian</button>
            </div>
          </div>
        </div>
        <p id="copyright" class="copyright"><?php echo t('copyright', $language, $translations); ?></p>
      </footer>
    </div>
  </div>

  <!-- Email subscription modal -->
  <div id="subscription-modal" class="modal hidden">
    <div class="modal-overlay"></div>
    <div class="modal-container">
      <button id="modal-close" class="modal-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
      <h2 id="modal-title" class="modal-title"><?php echo t('getUpdatesTitle', $language, $translations); ?></h2>
      <p id="modal-description" class="modal-description"><?php echo t('getUpdatesDescription', $language, $translations); ?></p>
      <form id="subscription-form" class="subscription-form" action="api/subscribe.php" method="post">
        <input type="email" id="email-input" name="email" class="email-input" placeholder="<?php echo t('emailPlaceholder', $language, $translations); ?>" required>
        <button type="submit" id="subscribe-button" class="button button-primary">
          <span id="subscribe-text"><?php echo t('subscribe', $language, $translations); ?></span>
        </button>
      </form>
    </div>
  </div>

  <!-- Tooltip container -->
  <div id="tooltip" class="tooltip hidden"></div>

  <!-- Scripts - Order matters! -->
  <script src="js/config.js"></script>
  <script src="js/theme.js"></script>
  <script src="js/language.js"></script>
  <script src="js/status-checker.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
