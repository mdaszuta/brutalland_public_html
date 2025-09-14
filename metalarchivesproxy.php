<?php
// metalarchivesproxy.php — cURL-based proxy for Metal Archives

// === CONFIG ===
const CACHE_TTL = 60;            // Browser cache in seconds
const RATE_WINDOW = 60;          // Rate limit window in seconds
const RATE_LIMIT = 30;           // Max requests in rate window per IP

const ALLOWED_HOSTS = [
    'metal-archives.com'     => true,
    'www.metal-archives.com' => true,
];

// User-Agent string and headers to use for outgoing cURL requests, mimicking a common browser
const FP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const FP_ACCEPT = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8";
const FP_ACCEPT_LANGUAGE = "en-US,en;q=0.9";

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
 * Output the response with appropriate headers.
 * @param string $body Response body
 * @param string $contentType Content-Type header value
 * @param string $cacheControl Cache-Control header value
 */
function proxy_output(string $body, string $contentType, string $cacheControl): void {
    add_security_headers();
    header("Content-Type: $contentType");
    header("Cache-Control: $cacheControl");
    echo $body;
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
 * Enforce rate limiting using APCu with sliding window and exponential backoff.
 * Tracks request timestamps per IP in memory.
 * Uses integer microseconds for precise time tracking.
 * Retries on race conditions to reduce lost updates.
 */
function enforce_rate_limit_apcu(): void {
    if (!function_exists('apcu_fetch')) {
        proxy_error(500, "Server error: APCu not available");
    }

    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = (int) (hrtime(true) / 1000); // current time in µs (monotonic clock)
    $key = "metalarchivesproxy:rate:" . md5($ip);

    $attempts = 0;
    while ($attempts++ < 3) {
        $requests = apcu_fetch($key, $success);

        if (!$success || !is_array($requests)) {
            $requests = [];
        }

        // Keep only timestamps within the sliding window (µs precision, monotonic)
        $windowStart = $now - (RATE_WINDOW * 1_000_000);
        $requests = array_filter($requests, fn($t) => is_int($t) && $t > $windowStart);

        // Cap array length (keep only the last RATE_LIMIT - 1 entries)
        if (count($requests) > RATE_LIMIT - 1) {
            $requests = array_slice($requests, -(RATE_LIMIT - 1));
        }

        if (count($requests) >= RATE_LIMIT) {
            proxy_error(429, "Rate limit exceeded. Try again later.");
        }

        $requests[] = $now;

        // Store back with TTL relative to RATE_WINDOW
        if (apcu_store($key, $requests, RATE_WINDOW)) {
            // Debug / monitoring headers
            header("X-RateLimit-Limit: " . RATE_LIMIT);
            header("X-RateLimit-Remaining: " . max(0, RATE_LIMIT - count($requests)));
            header("X-RateLimit-Reset: " . time() + RATE_WINDOW); // Reset time should be reported in wall clock seconds, not monotonic
            return;
        }

        // Exponential backoff: 2^(n-1) ms
        usleep(1000 * (1 << ($attempts - 1)));
    }

    proxy_error(500, "Server error: rate limit contention");
}

enforce_frontend_access();
/**
 * Validate that the request method is GET and the `url` parameter is present.
 * Returns the raw `url` parameter string.
 *
 * @return string
 */
function get_raw_url_param(): string {
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    proxy_error(405, "Method not allowed");
}

if (!isset($_GET['url'])) {
    proxy_error(400, "Missing url parameter");
}

    return $_GET['url'];
}

/**
 * Validate and sanitize the incoming `url` parameter.
 * Returns a canonical safe URL string for cURL.
 *
 * @param string $rawUrl
 * @return string
 */
function validate_and_build_safe_url(string $rawUrl): string {
    $parts = parse_url($rawUrl);

if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
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

unset($parts['fragment']);

// Ensure path always starts with '/' and query is normalized
$path = '/' . ltrim($parts['path'] ?? '', '/');

if ($path === '/' || !preg_match('#^/(bands|band/discography)/#', $path)) {
    proxy_error(400, "Path not allowed");
}

$query = '';
if (!empty($parts['query'])) {
    $queryArray = [];
    parse_str($parts['query'], $queryArray);
    if (!empty($queryArray)) {
        $query = '?' . http_build_query($queryArray, '', '&', PHP_QUERY_RFC3986);
    }
}

    return "https://$host$path$query";
}

$rawUrl  = get_raw_url_param();
$safeUrl = validate_and_build_safe_url($rawUrl);
enforce_rate_limit_apcu();

// === FETCH WITH cURL ===
$proxyRequest = curl_init($safeUrl);
curl_setopt_array($proxyRequest, [
    CURLOPT_RETURNTRANSFER  => true,
    CURLOPT_FOLLOWLOCATION  => true,
    CURLOPT_MAXREDIRS       => 5,
    CURLOPT_USERAGENT       => FP_USER_AGENT,
    CURLOPT_SSL_VERIFYPEER  => true,
    CURLOPT_SSL_VERIFYHOST  => 2,
    CURLOPT_PROTOCOLS       => CURLPROTO_HTTPS,
    CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
    CURLOPT_TIMEOUT         => 10,
    CURLOPT_CONNECTTIMEOUT  => 3,
    CURLOPT_ENCODING        => '',
    CURLOPT_HTTPHEADER      => [
        "Accept: " . FP_ACCEPT,
        "Accept-Language: " . FP_ACCEPT_LANGUAGE,
    ],
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
    proxy_error($httpcode, "Upstream server responded with an error");
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

proxy_output($response, $contentType, $cacheControl);
