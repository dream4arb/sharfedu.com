<?php
// Webhook for auto-deploy: when called with correct token, creates a flag file.
// Cron on server checks for the flag and runs git pull + deploy script.
$token = $_GET['token'] ?? $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
$secretFile = __DIR__ . '/.deploy-token';
if (!is_readable($secretFile)) {
  http_response_code(500);
  exit('No token file');
}
$expected = trim(file_get_contents($secretFile));
if ($token === '' || $token !== $expected) {
  http_response_code(403);
  exit('Forbidden');
}
file_put_contents(__DIR__ . '/deploy-requested.flag', '1');
header('Content-Type: text/plain; charset=utf-8');
echo 'OK';
