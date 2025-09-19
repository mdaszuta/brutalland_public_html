<?php
declare(strict_types=1);
// metalarchivesproxy.php — cURL-based proxy for Metal Archives

// Config
const CACHE_TTL = 60;            // Browser cache in seconds
const RATE_WINDOW = 60;          // Rate limit window in seconds
const RATE_LIMIT = 30;           // Max requests in rate window per IP

const ALLOWED_HOSTS = [
    'metal-archives.com'     => true,
    'www.metal-archives.com' => true,
];

// Define maximum allowed upstream response size (in bytes)
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB

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
 * Add content-specific headers (type + caching).
 *
 * @param string $contentType - Content-Type header value
 * @param string $cacheControl - Cache-Control header value
 */
function add_content_headers(string $contentType, string $cacheControl): void {
    header("Content-Type: $contentType");
    header("Cache-Control: $cacheControl");
}

/**
 * Send an error response and exit.
 *
 * @param int $status - HTTP status code
 * @param string $message - Error message
 */
function proxy_error(int $status, string $message): void {
    http_response_code($status);
    add_security_headers();
    add_content_headers("application/json; charset=UTF-8", "no-store, no-cache, must-revalidate");
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Output the response with appropriate headers.
 *
 * @param string $body - response body
 * @param string $contentType - Content-Type header value
 * @param string $cacheControl - Cache-Control header value
 */
function proxy_output(string $body, string $contentType, string $cacheControl): void {
    add_security_headers();
    add_content_headers($contentType, $cacheControl);
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
    $key = "metalarchivesproxy:rate:" . $ip;

    $attempts = 0;
    while ($attempts++ < 3) {
        $requests = apcu_fetch($key, $success);

        if (!$success || !is_array($requests)) {
            $requests = [];
        }

        // Keep only timestamps within the sliding window (µs precision, monotonic)
        $windowStart = $now - (RATE_WINDOW * 1_000_000);
        $requests = array_filter($requests, fn($t) => is_int($t) && $t > $windowStart);

        // --- Check limit *before* appending ---
        if (count($requests) >= RATE_LIMIT) {
            proxy_error(429, "Rate limit exceeded. Try again later.");
        }

        // Record this request
        $requests[] = $now;

        // --- Cap array length afterwards to avoid unbounded growth ---
        if (count($requests) > RATE_LIMIT) {
            $requests = array_slice($requests, -RATE_LIMIT);
        }

        // Store back with TTL relative to RATE_WINDOW
        if (apcu_store($key, $requests, RATE_WINDOW)) {
            // Debug / monitoring headers
            /*header("X-RateLimit-Limit: " . RATE_LIMIT);
            header("X-RateLimit-Remaining: " . max(0, RATE_LIMIT - count($requests)));
            header("X-RateLimit-Reset: " . time() + RATE_WINDOW);*/ // Reset time should be reported in wall clock seconds, not monotonic
            return;
        }

        usleep(1000 * (1 << ($attempts - 1))); // Exponential backoff: 2^(n-1) ms
    }

    proxy_error(500, "Server error: rate limit contention");
}

/**
 * Validate that the request method is GET and the `url` parameter is present.
 * Returns the raw `url` parameter string.
 *
 * @return string - raw URL parameter
 */
function get_raw_url_param(): string {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Allow: GET');
        proxy_error(405, "Method not allowed");
    }

    $rawUrl = $_GET['url'] ?? null;

    if ($rawUrl === null) {
        proxy_error(400, "Missing url parameter");
    }

    if (strlen($rawUrl) > 2048) {
        proxy_error(400, "Url too long");
    }

    return $rawUrl;
}

/**
 * Validate and sanitize the incoming `url` parameter.
 * Returns a canonical safe URL string for cURL.
 *
 * @param string $rawUrl - raw URL parameter
 * @return string - validated and sanitized URL
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

/**
 * Fetch a URL from Metal Archives with standard proxy defaults.
 *
 * @param string $url - validated URL to fetch
 * @return array [string|false $body, int $httpcode, string $contentType, string $error] - response details
 */
function fetch_with_curl(string $url): array {
    $maxSize = MAX_RESPONSE_SIZE;

    $proxyRequest = curl_init($url);

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
        // Enforce response size limit
        CURLOPT_NOPROGRESS      => false,
        CURLOPT_PROGRESSFUNCTION => function ($ch, $dltotal, $dlnow) use ($maxSize) {
            return ($dlnow > $maxSize) ? 1 : 0;
        },
    ]);

    $response = curl_exec($proxyRequest);
    $httpcode = curl_getinfo($proxyRequest, CURLINFO_HTTP_CODE);
    $contentType = trim(curl_getinfo($proxyRequest, CURLINFO_CONTENT_TYPE) ?? '');
    $finalUrl = curl_getinfo($proxyRequest, CURLINFO_EFFECTIVE_URL) ?: '';
    $err = curl_error($proxyRequest);

    // If callback aborted the transfer due to size limit, override error message
    if (curl_errno($proxyRequest) === CURLE_ABORTED_BY_CALLBACK) {
        $err = sprintf("Response exceeded size limit of %d bytes (%.3f MB).", $maxSize, $maxSize / 1048576);
    }

    curl_close($proxyRequest);

    if ($finalUrl !== '') {
        $finalParts = parse_url($finalUrl);
        $finalHost = strtolower(rtrim($finalParts['host'] ?? '', '.'));
        if (!isset(ALLOWED_HOSTS[$finalHost])) {
            return [false, 502, '', "Redirected to disallowed host: $finalHost"];
        }
    }

    return [$response, $httpcode, $contentType, $err];
}

// Main execution flow
enforce_frontend_access();
$rawUrl  = get_raw_url_param();
$safeUrl = validate_and_build_safe_url($rawUrl);
enforce_rate_limit_apcu();

[$response, $httpcode, $contentType, $err] = fetch_with_curl($safeUrl);

if ($response === false) {
    if ($httpcode === 502) {
        proxy_error(502, $err);
    } else {
        proxy_error(500, "cURL error: " . $err);
    }
}

if ($httpcode >= 400) {
    proxy_error($httpcode, "Upstream server responded with an error");
}

// Determine content type and caching policy
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
