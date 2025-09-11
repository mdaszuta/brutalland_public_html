<?php
// metalarchivesproxy.php — cURL-based proxy for Metal Archives

// === CONFIG ===
const RATE_DIR = __DIR__ . '/cache/production/metalarchivesproxy/';
const CACHE_TTL = 60;            // Browser cache in seconds
const RATE_WINDOW = 60;          // Rate limit window in seconds
const RATE_LIMIT = 30;           // Max requests in rate window per IP
const CLEANUP_INTERVAL = 86400;  // Cleanup interval in seconds (24 hours)
const FILE_EXPIRY = 7 * CLEANUP_INTERVAL;       // Expire per-IP rate files older than 7 CLEANUP_INTERVALs

const ALLOWED_HOSTS = [
    'metal-archives.com'     => true,
    'www.metal-archives.com' => true,
];

// User-Agent string to use for outgoing cURL requests
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36";

/**
 * Add security headers to the response.
 */
function add_security_headers(): void {
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("Referrer-Policy: no-referrer");
    header("Cross-Origin-Resource-Policy: same-origin");
    header("Cross-Origin-Opener-Policy: same-origin");
    header("Permissions-Policy: geolocation=(), microphone=(), camera=(), usb=(), payment=()");
    header("Content-Security-Policy: default-src 'none'; base-uri 'none'; form-action 'none'");
}

/**
 * Send an error response and exit.
 * @param int $status HTTP status code
 * @param string $message Error message
 */
function proxy_error(int $status, string $message): void {
    http_response_code($status);
    add_security_headers();
    header("Content-Type: application/json; charset=UTF-8");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Enforce that the request is made via AJAX (to prevent direct access).
 */
function enforce_frontend_access(): void {
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
        proxy_error(403, "Direct access forbidden");
    }
}

/**
 * Ensure the rate limit directory exists.
 */
function ensure_rate_dir(): void {
    if (!is_dir(RATE_DIR)) {
        if (!mkdir(RATE_DIR, 0700, true) && !is_dir(RATE_DIR)) {
            error_log("Failed to create cache dir " . RATE_DIR);
            proxy_error(500, "Server error: cache unavailable");
        }
    }
}

/**
 * Enforce rate limiting based on client IP, with race-safe file writes.
 * Uses a simple JSON file per IP to track request timestamps.
 * Exits with 429 if rate limit is exceeded.
 */
function enforce_rate_limit(): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $rateFilePath = RATE_DIR . "proxy_rate_" . md5($ip) . ".json";

    $rateFile = fopen($rateFilePath, 'c+');
    if (!$rateFile) {
        error_log("Failed to open rate file for $ip: $rateFilePath");
        proxy_error(500, "Server error: rate limit unavailable");
    }

    if (!flock($rateFile, LOCK_EX)) {
        fclose($rateFile);
        proxy_error(500, "Server error: rate limit locking failed");
    }

    rewind($rateFile);
    $data = stream_get_contents($rateFile);
    $requests = [];
    if ($data !== false && $data !== '') {
        $decoded = json_decode($data, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $requests = array_filter($decoded, fn($t) => is_int($t) && $t > $now - RATE_WINDOW);
        } else {
            error_log("Corrupted rate file for $ip: $rateFilePath");
        }
    }

    if (count($requests) >= RATE_LIMIT) {
        flock($rateFile, LOCK_UN);
        fclose($rateFile);
        proxy_error(429, "Rate limit exceeded. Try again later.");
    }

    $requests[] = $now;

    ftruncate($rateFile, 0);
    rewind($rateFile);
    fwrite($rateFile, json_encode(array_values($requests)));
    fflush($rateFile);

    flock($rateFile, LOCK_UN);
    fclose($rateFile);
}

/**
 * Cleanup old rate limit files once per 24 hours.
 * Removes only files older than FILE_EXPIRY.
 */
function cleanup_rate_limit_files(): void {
    $now = time();
    $cleanup_marker = RATE_DIR . "cleanup_marker";
    $last_cleanup   = is_file($cleanup_marker) ? filemtime($cleanup_marker) : 0;

    if ($now - $last_cleanup <= CLEANUP_INTERVAL) {
        return;
    }

    foreach (glob(RATE_DIR . "proxy_rate_*.json") as $file) {
        if (filemtime($file) < $now - FILE_EXPIRY) {
            @unlink($file); // ignore failures
        }
    }

    @touch($cleanup_marker);
}

// === INITIALIZE RATE LIMIT PROTECTION ===
enforce_frontend_access();
ensure_rate_dir();
enforce_rate_limit();
cleanup_rate_limit_files();

// === VALIDATE INPUT ===
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    proxy_error(405, "Method not allowed");
}

if (!isset($_GET['url'])) {
    proxy_error(400, "Missing url parameter");
}

$url = $_GET['url'];
$parts = parse_url($url);

if (!$parts || !isset($parts['scheme'], $parts['host'])) {
    proxy_error(400, "Invalid URL");
}

if (strtolower($parts['scheme']) !== 'https') {
    proxy_error(400, "Only HTTPS is allowed");
}

$host = strtolower(rtrim($parts['host'], '.'));
if (!isset(ALLOWED_HOSTS[$host])) {
    proxy_error(403, "Forbidden host");
}

if (isset($parts['port'])) {
    proxy_error(400, "Ports are not allowed");
}

if (!empty($parts['user']) || !empty($parts['pass'])) {
    proxy_error(400, "Userinfo not allowed in URL");
}

// Ensure path always starts with '/', then reconstruct canonical safe URL (scheme + host + path + query)
$path = '/' . ltrim($parts['path'] ?? '', '/');
$safeUrl = "https://$host$path" . (!empty($parts['query']) ? '?' . $parts['query'] : '');

// === FETCH WITH cURL ===
$proxyRequest = curl_init($safeUrl);
curl_setopt_array($proxyRequest, [
    CURLOPT_RETURNTRANSFER  => true,
    CURLOPT_FOLLOWLOCATION  => true,
    CURLOPT_MAXREDIRS       => 5,
    CURLOPT_USERAGENT       => USER_AGENT,
    CURLOPT_SSL_VERIFYPEER  => true,
    CURLOPT_SSL_VERIFYHOST  => 2,
    CURLOPT_PROTOCOLS       => CURLPROTO_HTTPS,
    CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
    CURLOPT_TIMEOUT         => 10,
    CURLOPT_CONNECTTIMEOUT  => 3,
    CURLOPT_ENCODING        => '',
    CURLOPT_HTTPHEADER      => [
        'Accept: text/html, application/json',
    ],
    CURLOPT_MAXFILESIZE     => 5 * 1024 * 1024, // 5 MB
]);

$response = curl_exec($proxyRequest);
$httpcode = curl_getinfo($proxyRequest, CURLINFO_HTTP_CODE);
$contentType = trim(curl_getinfo($proxyRequest, CURLINFO_CONTENT_TYPE) ?? '');
$err = curl_error($proxyRequest);
curl_close($proxyRequest);

if ($response === false) {
    proxy_error(500, "cURL error: " . $err);
}

if ($httpcode >= 400) {
    proxy_error($httpcode, "Upstream error $httpcode on $path");
}

// === CONTENT-TYPE HANDLING ===
$mediaType = strtolower(trim(explode(';', $contentType, 2)[0]));

switch ($mediaType) {
    case 'text/html':
        if (!str_contains(strtolower($contentType), 'charset=')) {
            $contentType = rtrim($contentType, " ;") . '; charset=UTF-8';
        }
        $cacheControl = "public, max-age=" . CACHE_TTL;
        break;

    case 'application/json':
        $cacheControl = "no-store, no-cache, must-revalidate";
        break;

    default:
        proxy_error(502, "Unexpected content type: $contentType");
}

// === OUTPUT RESPONSE ===
add_security_headers();
header("Content-Type: $contentType");
header("Cache-Control: $cacheControl");
echo $response;
