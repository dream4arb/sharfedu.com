<?php
/**
 * بروكسي لطلبات الصفحات (مثل /login) إلى Node — يعمل تحديث الصفحة مثل localhost.
 * يُستدعى من .htaccess عندما الطلب ليس ملفاً ولا مجلداً.
 */
$nodeHost = '127.0.0.1';
$nodePort = 5000;

$path = '/' . ltrim(isset($_GET['__path']) ? $_GET['__path'] : '', '/');
if ($path === '/') $path = '/';
$qs = $_SERVER['QUERY_STRING'] ?? '';
if ($qs !== '') {
    parse_str($qs, $params);
    unset($params['__path']);
    if (!empty($params)) $path .= '?' . http_build_query($params);
}

$url = "http://{$nodeHost}:{$nodePort}{$path}";

$ch = curl_init($url);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$headers = [];
$headers[] = 'Host: ' . ($_SERVER['HTTP_HOST'] ?? 'sharfedu.com');
$headers[] = 'X-Forwarded-Proto: ' . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
foreach (getallheaders() ?: [] as $k => $v) {
    $k = strtolower($k);
    if ($k === 'host' || $k === 'connection') continue;
    $headers[] = "$k: $v";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$err = curl_error($ch);
$info = curl_getinfo($ch);
curl_close($ch);

if ($err) {
    http_response_code(502);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html><body><h1>Proxy error</h1><p>' . htmlspecialchars($err) . '</p></body></html>';
    exit;
}

$headerSize = $info['header_size'];
$respHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

foreach (explode("\r\n", $respHeaders) as $line) {
    if (stripos($line, 'HTTP/') === 0) {
        $parts = explode(' ', $line, 3);
        if (isset($parts[1])) http_response_code((int)$parts[1]);
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
