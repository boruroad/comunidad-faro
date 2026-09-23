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

load_env_file(__DIR__ . '/.env');

function load_env_file($filePath)
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

function send_cors_headers()
{
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

function request_data()
{
    $request = $_GET;

    foreach ($_POST as $key => $value) {
        $request[$key] = $value;
    }

    $rawBody = file_get_contents('php://input');
    if ($rawBody !== false && trim($rawBody) !== '') {
        $decoded = json_decode($rawBody, true);

        if (is_array($decoded)) {
            foreach ($decoded as $key => $value) {
                $request[$key] = $value;
            }
        } else {
            parse_str($rawBody, $parsed);
            if (is_array($parsed)) {
                foreach ($parsed as $key => $value) {
                    $request[$key] = $value;
                }
            }
        }
    }

    return $request;
}

function get_bearer_token()
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

function camelize_keys($value)
{
    if (!is_array($value)) {
        return $value;
    }

    $isAssoc = array_keys($value) !== range(0, count($value) - 1);
    if (!$isAssoc) {
        return array_map('camelize_keys', $value);
    }

    $result = array();
    foreach ($value as $key => $item) {
        $result[snake_to_camel((string) $key)] = camelize_keys($item);
    }

    return $result;
}

function snake_to_camel($value)
{
    $value = strtolower($value);
    return preg_replace_callback('/_([a-z0-9])/', function ($matches) {
        return strtoupper($matches[1]);
    }, $value);
}

function camel_to_snake($value)
{
    $value = preg_replace('/[A-Z]/', '_$0', $value);
    return strtolower(ltrim($value, '_'));
}

function env_value($key, $default = '')
{
    $value = getenv($key);
    return ($value !== false && $value !== '') ? $value : $default;
}
