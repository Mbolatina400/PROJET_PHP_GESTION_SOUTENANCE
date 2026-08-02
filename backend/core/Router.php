<?php

declare(strict_types=1);

class Router
{
    private array $routes = [];

    public function get(string $path, array $handler, ?array $permission = null): void
    {
        $this->addRoute('GET', $path, $handler, $permission);
    }

    public function post(string $path, array $handler, ?array $permission = null): void
    {
        $this->addRoute('POST', $path, $handler, $permission);
    }

    public function put(string $path, array $handler, ?array $permission = null): void
    {
        $this->addRoute('PUT', $path, $handler, $permission);
    }

    public function delete(string $path, array $handler, ?array $permission = null): void
    {
        $this->addRoute('DELETE', $path, $handler, $permission);
    }

    private function addRoute(string $method, string $path, array $handler, ?array $permission): void
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'pattern' => '#^' . $pattern . '$#',
            'handler' => $handler,
            'permission' => $permission,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $path, $matches) !== 1) {
                continue;
            }

            if (!Auth::authorize($method, $route['path'], $route['permission'])) {
                return;
            }

            try {
                [$controllerClass, $action] = $route['handler'];
                $controller = new $controllerClass();
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $controller->{$action}(...array_values($params));
                AuditLog::record(Auth::user(), $method, $path);
            } catch (Throwable $exception) {
                $databaseUnavailable = Database::isConnectionException($exception);

                error_log(sprintf('[API] %s: %s', $exception::class, $exception->getMessage()));
                http_response_code($databaseUnavailable ? 503 : 500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'error' => $databaseUnavailable
                        ? Database::connectionErrorMessage($exception)
                        : 'Erreur interne du serveur',
                ], JSON_UNESCAPED_UNICODE);
            }
            return;
        }

        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => 'Route introuvable',
        ], JSON_UNESCAPED_UNICODE);
    }
}
