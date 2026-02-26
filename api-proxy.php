<?php
/**
 * Cloudways: بروكسي لطلبات /api إلى Node.js على المنفذ 5000
 * استخدم عندما لا يتوفر تعديل Nginx (دعم قياسي).
 *
 * الواجهة الأمامية يجب أن تستدعي /api-proxy.php/api/... بدل /api/...
 * (اضبط VITE_API_BASE=/api-proxy.php ثم npm run build)
 */

$nodeHost = '127.0.0.1';
$nodePort = 5000;
$path = isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] !== '' ? $_SERVER['PATH_INFO'] : null;
if ($path === null && !empty($_SERVER['REQUEST_URI'])) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $script = dirname($_SERVER['SCRIPT_NAME']) . '/' . basename($_SERVER['SCRIPT_NAME']);
    if ($script !== '/' && strpos($uri, $script) === 0) {
        $path = substr($uri, strlen($script)) ?: '/api';
    }
}
if (empty($path) || $path === '/') {
    $path = '/api';
}

$url = "http://{$nodeHost}:{$nodePort}{$path}";
if (!empty($_SERVER['QUERY_STRING'])) {
    $url .= '?' . $_SERVER['QUERY_STRING'];
}

$ch = curl_init($url);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$headers = [];
// إرسال Host و X-Forwarded-Proto حتى لا يعيد Node التوجيه إلى 127.0.0.1
$headers[] = 'Host: ' . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'sharfedu.com');
$headers[] = 'X-Forwarded-Proto: ' . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
foreach (getallheaders() ?: [] as $k => $v) {
    $k = strtolower($k);
    if ($k === 'host' || $k === 'connection') continue;
    $headers[] = "$k: $v";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$err = curl_error($ch);
$info = curl_getinfo($ch);
curl_close($ch);

if ($err) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Proxy error', 'message' => $err]);
    exit;
}

$headerSize = $info['header_size'];
$respHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

foreach (explode("\r\n", $respHeaders) as $line) {
    if (stripos($line, 'HTTP/') === 0) {
        $parts = explode(' ', $line, 3);
        if (isset($parts[1])) {
            http_response_code((int) $parts[1]);
        }
    } elseif (strpos($line, ':') !== false) {
        list($name, $value) = explode(':', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (strtolower($name) !== 'transfer-encoding') {
            header("$name: $value", false);
        }
    }
}

echo $body;
