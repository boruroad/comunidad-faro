<?php

spl_autoload_register(function ($class) {
    $base = __DIR__ . '/src/';
    $paths = array(
        'Controllers/' . $class . '.php',
        'Services/' . $class . '.php',
        'Repository/' . $class . '.php',
        'Models/' . $class . '.php',
        'Database/' . $class . '.php',
        'Http/' . $class . '.php',
    );

    foreach ($paths as $path) {
        $file = $base . $path;
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

loadEnvFile(__DIR__ . '/.env');

function loadEnvFile($filePath)
{
    if (!file_exists($filePath) || !is_readable($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!$lines) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $value = trim($value, "\"'");

        if ($key === '') {
            continue;
        }

        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

function sendCorsHeaders()
{
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

function requestData()
{
    $request = array_merge($_GET, $_POST);

    return array_merge($request, parseRawRequestBody());
}

function parseRawRequestBody()
{
    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || trim($rawBody) === '') {
        return array();
    }

    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) {
        return $decoded;
    }

    parse_str($rawBody, $parsed);

    return is_array($parsed) ? $parsed : array();
}

function getBearerToken()
{
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim((string) $_SERVER['HTTP_AUTHORIZATION']);
        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return trim($matches[1]);
        }
    }

    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = trim((string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return trim($matches[1]);
        }
    }

    return '';
}

function camelizeKeys($value)
{
    if (!is_array($value)) {
        return $value;
    }

    $isAssoc = array_keys($value) !== range(0, count($value) - 1);
    if (!$isAssoc) {
        return array_map('camelizeKeys', $value);
    }

    $result = array();
    foreach ($value as $key => $item) {
        $result[snakeToCamel((string) $key)] = camelizeKeys($item);
    }

    return $result;
}

function snakeToCamel($value)
{
    $value = strtolower($value);
    return preg_replace_callback('/_([a-z0-9])/', function ($matches) {
        return strtoupper($matches[1]);
    }, $value);
}

function camelToSnake($value)
{
    $value = preg_replace('/[A-Z]/', '_$0', $value);
    return strtolower(ltrim($value, '_'));
}

function envValue($key, $default = '')
{
    $value = getenv($key);
    return ($value !== false && $value !== '') ? $value : $default;
}
