<?php

declare(strict_types=1);

$allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$composerAutoload = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($composerAutoload)) {
    require_once $composerAutoload;
}

spl_autoload_register(function (string $class): void {
    $paths = [
        dirname(__DIR__) . '/core/' . $class . '.php',
        dirname(__DIR__) . '/models/' . $class . '.php',
        dirname(__DIR__) . '/controllers/' . $class . '.php',
        dirname(__DIR__) . '/helpers/' . $class . '.php',
    ];

    foreach ($paths as $path) {
        if (is_file($path)) {
            require_once $path;
            return;
        }
    }
});

try {
    $router = new Router();
    require dirname(__DIR__) . '/routes/api.php';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Throwable $exception) {
    error_log(sprintf(
        '[API] %s: %s in %s:%d',
        $exception::class,
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine()
    ));
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Erreur interne du serveur',
    ], JSON_UNESCAPED_UNICODE);
}
