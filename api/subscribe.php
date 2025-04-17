<?php
/**
 * API pentru abonarea la actualizări prin email
 * 
 * Acest script procesează cererile de abonare la actualizări prin email
 * și returnează rezultatul în format JSON.
 */

// Setează header-ul pentru JSON
header('Content-Type: application/json');

// Verifică metoda HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Obține email-ul din cerere
$email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) : null;

if (!$email) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email invalid sau lipsă'
    ]);
    exit;
}

try {
    // În implementarea reală, aici ar trebui să salvați email-ul în baza de date
    // sau să-l trimiteți către un serviciu precum Mailchimp, SendGrid, etc.
    
    // Simulăm o întârziere pentru a face procesul să pară real
    sleep(1);
    
    // Înregistrează email-ul (pentru demonstrație)
    $result = saveSubscription($email);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => "Adresa $email a fost abonată cu succes la actualizări!"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Nu s-a putut salva abonamentul. Vă rugăm să încercați din nou.'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Eroare la procesarea cererii: ' . $e->getMessage()
    ]);
}

/**
 * Salvează un abonament în fișier
 * 
 * În producție, ar trebui să folosiți o bază de date în loc de un fișier
 * 
 * @param string $email Adresa de email
 * @return bool True dacă salvarea a reușit, False în caz contrar
 */
function saveSubscription($email) {
    $subscriptionsFile = __DIR__ . '/../data/subscriptions.txt';
    $subscriptionsDir = dirname($subscriptionsFile);
    
    // Creează directorul dacă nu există
    if (!file_exists($subscriptionsDir)) {
        mkdir($subscriptionsDir, 0755, true);
    }
    
    // Verifică dacă email-ul este deja abonat
    if (file_exists($subscriptionsFile)) {
        $subscriptions = file($subscriptionsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (in_array($email, $subscriptions)) {
            return true; // Email-ul este deja abonat
        }
    }
    
    // Adaugă email-ul la fișier
    $result = file_put_contents(
        $subscriptionsFile,
        $email . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
    
    return $result !== false;
}
