<?php
/**
 * API pentru verificarea stării serverelor
 * 
 * Acest script verifică starea unui server prin diverse metode
 * și returnează rezultatul în format JSON.
 */

// Setează header-ul pentru JSON
header('Content-Type: application/json');

// Activează afișarea erorilor pentru depanare
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Obține adresa și portul din parametrii de query
$address = isset($_GET['address']) ? $_GET['address'] : null;
$timeout = isset($_GET['timeout']) ? intval($_GET['timeout']) : 3;
$port = isset($_GET['port']) ? intval($_GET['port']) : 80;

if (!$address) {
    http_response_code(400);
    echo json_encode(['error' => 'Address parameter is required']);
    exit;
}

try {
    // Verifică starea serverului
    $result = checkServerStatus($address, $timeout, $port);
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to check server status: ' . $e->getMessage()]);
}

/**
 * Verifică starea unui server folosind multiple metode
 * 
 * @param string $address Adresa IP sau domeniul serverului
 * @param int $timeout Timeout în secunde
 * @param int $port Portul pentru conexiune
 * @return array Rezultatul verificării (status, responseTime, timestamp)
 */
function checkServerStatus($address, $timeout = 3, $port = 80) {
    $startTime = microtime(true);
    
    // Verifică dacă adresa este un URL HTTP/HTTPS
    if (preg_match('~^https?://~i', $address)) {
        // Verifică server HTTP
        $result = checkHttpServer($address, $timeout);
    } else {
        // Încearcă multiple metode de verificare
        $isReachable = false;
        $responseTime = 0;
        
        // Metodă 1: Verificare socket (cea mai fiabilă pentru servere externe)
        $socketResult = checkSocketConnection($address, $port, $timeout);
        if ($socketResult['status']) {
            $isReachable = true;
            $responseTime = $socketResult['responseTime'];
        }
        
        // Metodă 2: Verificare DNS (pentru domenii)
        if (!$isReachable && !filter_var($address, FILTER_VALIDATE_IP)) {
            $dnsResult = checkDnsRecord($address);
            if ($dnsResult['status']) {
                // DNS există, dar încă trebuie să verificăm dacă serverul răspunde
                $socketResult = checkSocketConnection($dnsResult['ip'], $port, $timeout);
                if ($socketResult['status']) {
                    $isReachable = true;
                    $responseTime = $socketResult['responseTime'];
                }
            }
        }
        
        // Metodă 3: Ping (poate fi blocat de firewall-uri)
        if (!$isReachable && function_exists('exec') && !in_array('exec', array_map('trim', explode(',', ini_get('disable_functions'))))) {
            $pingResult = pingServer($address, $timeout);
            if ($pingResult['status']) {
                $isReachable = true;
                $responseTime = $pingResult['responseTime'];
            }
        }
        
        // Metodă 4: Pentru servere Minecraft specifice
        if (!$isReachable && $port == 25565) {
            $mcResult = checkMinecraftServer($address, $port, $timeout);
            if ($mcResult['status']) {
                $isReachable = true;
                $responseTime = $mcResult['responseTime'];
            }
        }
        
        $result = [
            'status' => $isReachable ? 'online' : 'offline',
            'responseTime' => $responseTime
        ];
    }
    
    $result['timestamp'] = date('c');
    return $result;
}

/**
 * Verifică o conexiune socket la un server
 * 
 * @param string $address Adresa IP sau domeniul serverului
 * @param int $port Portul pentru conexiune
 * @param int $timeout Timeout în secunde
 * @return array Rezultatul verificării (status, responseTime)
 */
function checkSocketConnection($address, $port = 80, $timeout = 3) {
    $startTime = microtime(true);
    
    // Setează un timeout pentru operația de socket
    $context = stream_context_create([
        'socket' => [
            'tcp_nodelay' => true,
            'bindto' => '0:0'
        ]
    ]);
    
    // Încearcă să deschidă o conexiune socket
    $socket = @stream_socket_client(
        "tcp://{$address}:{$port}", 
        $errno, 
        $errstr, 
        $timeout, 
        STREAM_CLIENT_CONNECT, 
        $context
    );
    
    $responseTime = round((microtime(true) - $startTime) * 1000);
    
    if ($socket) {
        fclose($socket);
        return [
            'status' => true,
            'responseTime' => $responseTime
        ];
    }
    
    return [
        'status' => false,
        'responseTime' => 0
    ];
}

/**
 * Verifică dacă un domeniu are înregistrări DNS valide
 * 
 * @param string $domain Domeniul de verificat
 * @return array Rezultatul verificării (status, ip)
 */
function checkDnsRecord($domain) {
    $ip = gethostbyname($domain);
    
    // Dacă gethostbyname nu poate rezolva domeniul, returnează același string
    if ($ip !== $domain) {
        return [
            'status' => true,
            'ip' => $ip
        ];
    }
    
    // Încearcă să obții înregistrări DNS de tip A
    $dnsRecords = @dns_get_record($domain, DNS_A);
    if ($dnsRecords && count($dnsRecords) > 0) {
        return [
            'status' => true,
            'ip' => $dnsRecords[0]['ip']
        ];
    }
    
    return [
        'status' => false,
        'ip' => null
    ];
}

/**
 * Verifică un server prin ping
 * 
 * @param string $address Adresa IP sau domeniul serverului
 * @param int $timeout Timeout în secunde
 * @return array Rezultatul verificării (status, responseTime)
 */
function pingServer($address, $timeout = 3) {
    $startTime = microtime(true);
    
    // Detectează sistemul de operare pentru a formata comanda ping corect
    $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    
    if ($isWindows) {
        // Comanda ping pentru Windows
        $command = "ping -n 1 -w " . ($timeout * 1000) . " " . escapeshellarg($address);
    } else {
        // Comanda ping pentru Linux/Unix
        $command = "ping -c 1 -W " . $timeout . " " . escapeshellarg($address) . " 2>&1";
    }
    
    // Execută comanda
    $output = [];
    $returnCode = 1;
    @exec($command, $output, $returnCode);
    
    $responseTime = round((microtime(true) - $startTime) * 1000);
    
    // Analizează output-ul pentru a extrage timpul de răspuns
    if ($returnCode === 0) {
        // Încearcă să extragă timpul de răspuns din output
        $extractedTime = 0;
        foreach ($output as $line) {
            if (preg_match('/time[=<]([\d\.]+)\s*ms/i', $line, $matches)) {
                $extractedTime = floatval($matches[1]);
                break;
            }
        }
        
        return [
            'status' => true,
            'responseTime' => $extractedTime > 0 ? $extractedTime : $responseTime
        ];
    }
    
    return [
        'status' => false,
        'responseTime' => 0
    ];
}

/**
 * Verifică un server HTTP
 * 
 * @param string $url URL-ul serverului
 * @param int $timeout Timeout în secunde
 * @return array Rezultatul verificării (status, responseTime)
 */
function checkHttpServer($url, $timeout = 3) {
    // Asigură-te că URL-ul începe cu http:// sau https://
    if (!preg_match('~^https?://~i', $url)) {
        $url = 'http://' . $url;
    }
    
    $startTime = microtime(true);
    $result = ['status' => 'offline', 'responseTime' => 0];
    
    // Verifică dacă cURL este disponibil
    if (function_exists('curl_init')) {
        // Inițializează cURL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        // Execută cererea
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        // Calculează timpul de răspuns
        $responseTime = round((microtime(true) - $startTime) * 1000);
        
        // Închide sesiunea cURL
        curl_close($ch);
        
        // Determină statusul pe baza codului HTTP
        if ($response !== false && $error === '') {
            if ($httpCode >= 200 && $httpCode < 400) {
                $result['status'] = 'online';
                $result['responseTime'] = $responseTime;
            } else if ($httpCode >= 400 && $httpCode < 500) {
                $result['status'] = 'maintenance';
                $result['responseTime'] = $responseTime;
            } else {
                $result['status'] = 'offline';
            }
        }
    } else {
        // Fallback la file_get_contents dacă cURL nu este disponibil
        $context = stream_context_create([
            'http' => [
                'timeout' => $timeout,
                'method' => 'HEAD'
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        $responseTime = round((microtime(true) - $startTime) * 1000);
        
        if ($response !== false) {
            $result['status'] = 'online';
            $result['responseTime'] = $responseTime;
        }
    }
    
    return $result;
}

/**
 * Verifică un server Minecraft
 * 
 * @param string $address Adresa IP sau domeniul serverului
 * @param int $port Portul pentru conexiune (implicit 25565)
 * @param int $timeout Timeout în secunde
 * @return array Rezultatul verificării (status, responseTime)
 */
function checkMinecraftServer($address, $port = 25565, $timeout = 3) {
    $startTime = microtime(true);
    
    try {
        // Deschide socket
        $socket = @fsockopen($address, $port, $errno, $errstr, $timeout);
        
        if (!$socket) {
            return [
                'status' => false,
                'responseTime' => 0
            ];
        }
        
        // Setează timeout pentru citire/scriere
        stream_set_timeout($socket, $timeout);
        
        // Protocolul Minecraft Server List Ping
        // https://wiki.vg/Server_List_Ping
        
        // Trimite pachetul de handshake
        $data = "\x00"; // Packet ID
        $data .= "\x04"; // Protocol version (4 pentru 1.7.2)
        $data .= pack('c', strlen($address)) . $address; // Server address
        $data .= pack('n', $port); // Server port
        $data .= "\x01"; // Next state (1 pentru status)
        
        $data = pack('c', strlen($data)) . $data; // Prepend length
        
        fwrite($socket, $data);
        
        // Trimite pachetul de status
        fwrite($socket, "\x01\x00"); // Packet ID 0, length 1
        
        // Citește răspunsul
        $length = fread($socket, 4); // Citește lungimea pachetului
        
        if (!$length) {
            fclose($socket);
            return [
                'status' => false,
                'responseTime' => 0
            ];
        }
        
        fclose($socket);
        
        $responseTime = round((microtime(true) - $startTime) * 1000);
        
        return [
            'status' => true,
            'responseTime' => $responseTime
        ];
    } catch (Exception $e) {
        return [
            'status' => false,
            'responseTime' => 0
        ];
    }
}
