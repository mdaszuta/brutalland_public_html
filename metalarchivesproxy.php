<?php
declare(strict_types=1);
// metalarchivesproxy.php — cURL-based proxy for Metal Archives

// Config
const BROWSER_CACHE_TTL = 60;    // Browser cache in seconds
const SERVER_CACHE_TTL = 3;      // Server-side APCu cache for valid HTML responses (3 sek)
const RATE_WINDOW = 60;          // Rate limit window in seconds
const RATE_LIMIT = 30;           // Max requests in rate window per IP

const ALLOWED_HOSTS = [
    'metal-archives.com'     => true,
    'www.metal-archives.com' => true,
];
const CANONICAL_HOST = 'www.metal-archives.com';

// Define maximum allowed upstream response size (in bytes)
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB

// User-Agent string and headers to use for outgoing cURL requests, mimicking a common browser
const FP_CHROME_MAJOR    = '158';
const FP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' . FP_CHROME_MAJOR . '.0.0.0 Safari/537.36';
// FP_SEC_CH_UA changes with each major Chrome release!
const FP_SEC_CH_UA = '"Chromium";v="' . FP_CHROME_MAJOR . '", "Not.A/Brand";v="24", "Google Chrome";v="' . FP_CHROME_MAJOR . '"';
const FP_ACCEPT_DOC = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
const FP_ACCEPT_AJAX = 'text/html, */*; q=0.01';
const FP_ACCEPT_LANGUAGE = 'en-US,en;q=0.9';

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
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '{"error":"Internal error"}';
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

        // Keep only timestamps within the sliding window (µs precision, monotonic) and re-index cleanly
        $windowStart = $now - (RATE_WINDOW * 1_000_000);
        $requests = array_values(array_filter($requests, fn($t) => is_int($t) && $t > $windowStart));

        // --- Check limit *before* appending ---
        if (count($requests) >= RATE_LIMIT) {
            proxy_error(429, "Rate limit exceeded. Try again later.");
        }

        // Record this request
        $requests[] = $now;

        // Store back with TTL relative to RATE_WINDOW
        if (apcu_store($key, $requests, RATE_WINDOW)) {
            // Debug / monitoring headers
            /*
            header("X-RateLimit-Limit: " . RATE_LIMIT);
            header("X-RateLimit-Remaining: " . max(0, RATE_LIMIT - count($requests)));
            header("X-RateLimit-Reset: " . (time() + RATE_WINDOW));
            */ // Reset time should be reported in wall clock seconds, not monotonic
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

    if (!is_string($rawUrl) || $rawUrl === '') {
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

    // Ensure path always starts with '/'
    $path = '/' . ltrim($parts['path'] ?? '', '/');

    // Block dot-segments (/./ or /../) to prevent path traversal, while allowing bands like "...and Oceans"
    if (preg_match('~/(?:\.\.?)(?:/|\z)~', rawurldecode($path))) {
        proxy_error(400, "Path traversal not allowed");
    }

    // Allow only exact band profile and discography table endpoints
    $isBandPage = (bool) preg_match('~^/bands/[^/?#\s]+/\d+\z~', $path);
    $isDiscographyTab = (bool) preg_match('~^/band/discography/id/\d+/tab/all/?\z~', $path);

    if (!$isBandPage && !$isDiscographyTab) {
        proxy_error(400, "Path not allowed");
    }

    // Always normalize to canonical host (avoids redundant 301 redirects and duplicate cache keys)
    return 'https://' . CANONICAL_HOST . $path;
}

/**
 * Fetch a URL from Metal Archives with consistent Chrome headers and HTTP/2.
 *
 * @param string $url - validated URL to fetch
 * @return array [string|false $body, int $httpcode, string $contentType, string $error] - response details
 */
function fetch_with_curl(string $url): array {
    $maxSize = MAX_RESPONSE_SIZE;
    $proxyRequest = curl_init($url);

    if ($proxyRequest === false) {
        return [false, 500, '', 'Failed to initialize cURL'];
    }

    $isDiscography = str_contains($url, '/band/discography/');

    // Build consistent Chrome Client Hints & Fetch Metadata headers
    if ($isDiscography) {
        $headers = [
            'Accept: ' . FP_ACCEPT_AJAX,
            'Accept-Language: ' . FP_ACCEPT_LANGUAGE,
            'Referer: https://' . CANONICAL_HOST . '/',
            'X-Requested-With: XMLHttpRequest',
            'Sec-CH-UA: ' . FP_SEC_CH_UA,
            'Sec-CH-UA-Mobile: ?0',
            'Sec-CH-UA-Platform: "Windows"',
            'Sec-Fetch-Dest: empty',
            'Sec-Fetch-Mode: cors',
            'Sec-Fetch-Site: same-origin',
        ];
    } else {
        $headers = [
            'Accept: ' . FP_ACCEPT_DOC,
            'Accept-Language: ' . FP_ACCEPT_LANGUAGE,
            'Upgrade-Insecure-Requests: 1',
            'Sec-CH-UA: ' . FP_SEC_CH_UA,
            'Sec-CH-UA-Mobile: ?0',
            'Sec-CH-UA-Platform: "Windows"',
            'Sec-Fetch-Dest: document',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: none',
            'Sec-Fetch-User: ?1',
        ];
    }

    curl_setopt_array($proxyRequest, [
        CURLOPT_RETURNTRANSFER   => true,
        CURLOPT_FOLLOWLOCATION   => true,
        CURLOPT_MAXREDIRS        => 3,
        CURLOPT_HTTP_VERSION     => CURL_HTTP_VERSION_2TLS,
        CURLOPT_USERAGENT        => FP_USER_AGENT,
        CURLOPT_SSL_VERIFYPEER   => true,
        CURLOPT_SSL_VERIFYHOST   => 2,
        CURLOPT_PROTOCOLS        => CURLPROTO_HTTPS,
        CURLOPT_REDIR_PROTOCOLS  => CURLPROTO_HTTPS,
        CURLOPT_TIMEOUT          => 10,
        CURLOPT_CONNECTTIMEOUT   => 3,
        CURLOPT_ENCODING         => '',
        CURLOPT_HTTPHEADER       => $headers,
        // Enforce response size limit
        CURLOPT_NOPROGRESS       => false,
        CURLOPT_PROGRESSFUNCTION => function ($ch, $dltotal, $dlnow) use ($maxSize) {
            return ($dlnow > $maxSize) ? 1 : 0;
        },
    ]);

    $response = curl_exec($proxyRequest);
    $httpcode = (int) curl_getinfo($proxyRequest, CURLINFO_HTTP_CODE);
    $rawContentType = curl_getinfo($proxyRequest, CURLINFO_CONTENT_TYPE);
    $contentType = is_string($rawContentType) ? trim($rawContentType) : '';
    $rawFinalUrl = curl_getinfo($proxyRequest, CURLINFO_EFFECTIVE_URL);
    $finalUrl = is_string($rawFinalUrl) ? $rawFinalUrl : '';
    $err = curl_error($proxyRequest);
    $errno = curl_errno($proxyRequest);

    // If callback aborted the transfer due to size limit, override error message
    if ($errno === CURLE_ABORTED_BY_CALLBACK) {
        $err = sprintf("Response exceeded size limit of %d bytes (%.3f MB).", $maxSize, $maxSize / 1048576);
    }

    //curl_close($proxyRequest);
    unset($proxyRequest);

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

// Initialize phpBB session for user authentication - we include the common.php file to access user session data.
// Note: Adjust the path to common.php if this script is placed in a different directory relative to phpBB's root.
define('IN_PHPBB', true);
$phpbb_root_path = (defined('PHPBB_ROOT_PATH')) ? PHPBB_ROOT_PATH : './';
$phpEx = substr(strrchr(__FILE__, '.'), 1);
require($phpbb_root_path . 'common.' . $phpEx);

$user->session_begin(false); // false = doesn't overwrite "Who is online" table, since this is a proxy request

// Check if the user is logged in and not a bot
if (!$user->data['is_registered'] || $user->data['is_bot']) {
    proxy_error(403, "Authentication required");
}

// Check server-side APCu cache before hitting Metal Archives
$cacheKey = 'metalarchivesproxy:cache:' . hash('sha256', $safeUrl);

if (SERVER_CACHE_TTL > 0) {
    $cached = apcu_fetch($cacheKey, $cacheHit);
    if ($cacheHit && is_array($cached) && isset($cached['body'], $cached['contentType'])) {
        proxy_output($cached['body'], $cached['contentType'], "private, max-age=" . BROWSER_CACHE_TTL);
        exit;
    }
}

[$response, $httpcode, $contentType, $err] = fetch_with_curl($safeUrl);

if ($response === false) {
    if ($httpcode === 502) {
        proxy_error(502, $err);
    } else {
        proxy_error(500, "cURL error: " . $err);
    }
}

if ($httpcode >= 400) {
    $upstreamError = match ($httpcode) {
        403, 503 => "Metal Archives temporarily blocked or unavailable (HTTP $httpcode)",
        404      => "Band page not found on Metal Archives",
        429      => "Metal Archives rate limit reached. Try again later.",
        default  => "Metal Archives responded with HTTP $httpcode",
    };
    proxy_error($httpcode, $upstreamError);
}

// Verify HTML content type (Metal Archives band/discography endpoints always return text/html) and set caching policy
$mediaType = strtolower(trim(explode(';', $contentType, 2)[0]));

if ($mediaType !== 'text/html') {
    proxy_error(502, "Unexpected content type: $contentType");
}

$contentType = 'text/html; charset=UTF-8';
$cacheControl = "private, max-age=" . BROWSER_CACHE_TTL;

// Store valid HTML response in APCu to reduce outgoing requests to Metal Archives
if ($httpcode === 200 && SERVER_CACHE_TTL > 0) {
    apcu_store($cacheKey, [
        'body'        => $response,
        'contentType' => $contentType,
    ], SERVER_CACHE_TTL);
}

proxy_output($response, $contentType, $cacheControl);
