<?php
// metalarchivesproxy.php — cURL-based proxy for Metal Archives

// === CONFIG ===
const CACHE_DIR = __DIR__ . '/cache/production/metalarchivesproxy/';
const CACHE_TTL = 60;            // Browser cache in seconds
const RATE_WINDOW = 60;          // Rate limit window in seconds
const RATE_LIMIT = 30;           // Max requests in rate window per IP
const CLEANUP_INTERVAL = 86400; // Cleanup rate limit files older than this (seconds) - each 24h

// Whitelisted origins
const ALLOWED_ORIGINS = [
    'https://brutalland.pl' => true,
    'https://localhost'     => true,
    'https://127.0.0.1'     => true,
    'http://localhost'      => true,
    'http://127.0.0.1'      => true,
];

// Whitelist only these hosts
const ALLOWED_HOSTS = [
    'metal-archives.com'     => true,
    'www.metal-archives.com' => true,
];

// Fixed UA (can later rotate if needed)
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36";

function add_security_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (isset(ALLOWED_ORIGINS[$origin])) {
        header("Access-Control-Allow-Origin: $origin");
        header("Vary: Origin"); // important for caching/CDN
    }

    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("Referrer-Policy: no-referrer");
    header("Cross-Origin-Resource-Policy: same-origin");
    header("Cross-Origin-Opener-Policy: same-origin");
    // header("Cross-Origin-Embedder-Policy: require-corp"); // enable only if needed
    header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
}

// === HELPER: consistent JSON error output ===
function proxy_error(int $status, string $message): void {
    http_response_code($status);
    add_security_headers();
    header("Content-Type: application/json; charset=UTF-8");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Ensure that the cache directory exists and is writable.
 */
function ensure_cache_dir(): void {
    if (!is_dir(CACHE_DIR)) {
        if (!mkdir(CACHE_DIR, 0700, true) && !is_dir(CACHE_DIR)) {
            error_log("Failed to create cache dir " . CACHE_DIR);
            proxy_error(500, "Server error: cache unavailable");
        }
    }
}

/**
 * Enforce per-IP rate limiting.
 * Blocks if RATE_LIMIT requests exceeded in RATE_WINDOW seconds.
 */
function enforce_rate_limit(): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $rate_file = CACHE_DIR . "proxy_rate_" . md5($ip) . ".json";

    // Load request history
    $requests = [];
    if (is_readable($rate_file)) {
        $data = file_get_contents($rate_file);
        if ($data === false) {
            error_log("Rate limit: failed to read $rate_file for $ip");
        } else {
            $decoded = json_decode($data, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $requests = array_filter($decoded, fn($t) => is_int($t) && $t > $now - RATE_WINDOW);
            } else {
                // Fail-open if corrupted
                error_log("Rate limit file corrupted for $ip: $rate_file");
            }
        }
    }

    // Check current count
    if (count($requests) >= RATE_LIMIT) {
        proxy_error(429, "Rate limit exceeded. Try again later.");
    }

    // Record new request
    $requests[] = $now;
    $json = json_encode(array_values($requests));
    if ($json === false) {
        error_log("Rate limit: json_encode failed for $ip: " . json_last_error_msg());
    } elseif (file_put_contents($rate_file, $json, LOCK_EX) === false) {
        error_log("Rate limit: failed to write $rate_file for $ip");
    }
}

/**
 * Cleanup old rate limit files once per 60 minutes.
 */
function cleanup_rate_limit_files(): void {
    $now = time();
    $cleanup_marker = CACHE_DIR . "cleanup_marker";
    $last_cleanup   = is_file($cleanup_marker) ? filemtime($cleanup_marker) : 0;

    if ($now - $last_cleanup > CLEANUP_INTERVAL) {
        foreach (glob(CACHE_DIR . "proxy_rate_*.json") as $file) {
            @unlink($file); // don’t care if some fail
        }
        @touch($cleanup_marker);
    }
}

// === INITIALIZE RATE LIMIT PROTECTION ===
ensure_cache_dir();
enforce_rate_limit();
cleanup_rate_limit_files();

// === VALIDATE INPUT ===
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

// Ensure path always starts with '/'
$path = '/' . ltrim($parts['path'] ?? '', '/');

// Rebuild canonical safe URL (scheme + host + path + query)
$safeUrl = "https://$host$path" . (!empty($parts['query']) ? '?' . $parts['query'] : '');

// === FETCH WITH cURL ===
$proxyRequest = curl_init($safeUrl);
curl_setopt_array($proxyRequest, [
    CURLOPT_RETURNTRANSFER  => true,
    CURLOPT_FOLLOWLOCATION  => true,
    CURLOPT_MAXREDIRS       => 5,
    CURLOPT_USERAGENT       => USER_AGENT,
    CURLOPT_SSL_VERIFYPEER  => true,
    CURLOPT_PROTOCOLS       => CURLPROTO_HTTPS,
    CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
    CURLOPT_TIMEOUT         => 15,
    CURLOPT_CONNECTTIMEOUT  => 5,
    CURLOPT_ENCODING        => '',
]);

$response = curl_exec($proxyRequest);

if ($response === false) {
    $err = curl_error($proxyRequest);
    curl_close($proxyRequest);
    proxy_error(500, "cURL error: " . $err);
}

$httpcode    = curl_getinfo($proxyRequest, CURLINFO_HTTP_CODE);
$contentType = trim(curl_getinfo($proxyRequest, CURLINFO_CONTENT_TYPE) ?? '');
curl_close($proxyRequest);

// Check HTTP status
if ($httpcode >= 400) {
    proxy_error($httpcode, "Upstream error $httpcode on $path");
}

$lowercaseContentType = strtolower($contentType);

// Allow only HTML or JSON
if (!str_starts_with($lowercaseContentType, 'text/html') && !str_starts_with($lowercaseContentType, 'application/json')) {
    proxy_error(502, "Unexpected content type: $contentType");
}

// Always enforce UTF-8 for HTML responses
if ($contentType === '') {
    // Upstream didn’t send a Content-Type → pick a safe default
    $contentType = 'text/html; charset=UTF-8';
} elseif (str_starts_with($lowercaseContentType, 'text/html') && !str_contains($lowercaseContentType, 'charset=')) {
    // Upstream sent a type but no charset → preserve type, add charset
    $contentType = rtrim($contentType, " ;") . '; charset=UTF-8';
}

// === OUTPUT ===
add_security_headers();
header("Content-Type: $contentType");
if (str_starts_with($lowercaseContentType, 'application/json')) {
    header("Cache-Control: no-store, no-cache, must-revalidate");
} else {
    header("Cache-Control: public, max-age=" . CACHE_TTL);
}

echo $response;
