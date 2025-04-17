<?php
/**
* Configuring servers for monitoring
*
* Each server has the following properties:
* - id: A unique identifier for the server
* - nameKey: The key for translation from the language file
* - address: The IP address or domain name of the server
* - port: The port to check
* - checkInterval: (Optional) The check interval in milliseconds
* - timeout: (Optional) The maximum time to wait for a response in milliseconds
*/

return [
    // Default check interval (5 seconds)
    'DEFAULT_CHECK_INTERVAL' => 5000,
    
    // Default timeout (3 seconds)
    'DEFAULT_TIMEOUT' => 3000,
    
    // List of servers to monitor
    'servers' => [
        [
            'id' => 'web-server',
            'nameKey' => 'webServer',
            'address' => '89.42.218.99',
            'port' => 80, // Port for HTTP verification
            'checkInterval' => 1000,
        ],
        [
            'id' => 'minecraft-server',
            'nameKey' => 'minecraftServer',
            'address' => 'mc.gamster.org',
            'port' => 25565, // Port for Minecraft
            'checkInterval' => 1000,
        ],
        [
            'id' => 'api-server',
            'nameKey' => 'apiServer',
            'address' => '89.42.218.99',
            'port' => 80,
            'checkInterval' => 1000,
        ],
        [
            'id' => 'database',
            'nameKey' => 'database',
            'address' => 'db.example.com',
            'port' => 3306, // Port for MySQL
            'checkInterval' => 1000,
        ],
        [
            'id' => 'storage',
            'nameKey' => 'storage',
            'address' => 'storage.example.com',
            'port' => 80,
            'checkInterval' => 1000,
        ],
    ]
];
