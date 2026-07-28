<?php

declare(strict_types=1);

$envPath = dirname(__DIR__) . '/.env';

if (is_readable($envPath)) {
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (preg_match('/^DB_[A-Z_]+$/', $name) !== 1 || getenv($name) !== false) {
            continue;
        }

        if (strlen($value) >= 2 && $value[0] === '"' && $value[-1] === '"') {
            $value = stripcslashes(substr($value, 1, -1));
        }

        putenv("{$name}={$value}");
    }
}

$env = static function (string $name, string $default): string {
    $value = getenv($name);
    return $value === false ? $default : $value;
};

return [
    'host' => $env('DB_HOST', '127.0.0.1'),
    'port' => $env('DB_PORT', '3306'),
    'database' => $env('DB_DATABASE', 'gestion_soutenances'),
    'username' => $env('DB_USERNAME', 'root'),
    'password' => $env('DB_PASSWORD', ''),
    'charset' => $env('DB_CHARSET', 'utf8mb4'),
];
