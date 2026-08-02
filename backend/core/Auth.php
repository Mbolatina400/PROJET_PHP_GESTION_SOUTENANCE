<?php

declare(strict_types=1);

class Auth
{
    private static ?array $user = null;
    private static bool $resolved = false;

    public static function login(array $user): void
    {
        self::startSession();
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        self::$user = self::withPermissions($user);
        self::$resolved = true;
    }

    public static function logout(): void
    {
        self::startSession();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
        }
        session_destroy();
        self::$user = null;
        self::$resolved = true;
    }

    public static function user(): ?array
    {
        if (self::$resolved) {
            return self::$user;
        }

        self::startSession();
        self::$resolved = true;
        $id = $_SESSION['user_id'] ?? null;
        if (!is_int($id) && !ctype_digit((string) $id)) {
            return null;
        }

        try {
            $user = (new Utilisateur())->findActiveById((int) $id);
            if ($user === null) {
                $_SESSION = [];
            }
            self::$user = $user === null ? null : self::withPermissions($user);
            return self::$user;
        } catch (Throwable) {
            return null;
        }
    }

    public static function authorize(string $method, string $path, ?array $permission = null): bool
    {
        if (in_array($path, ['/api/health/database', '/api/auth/login'], true)) {
            return true;
        }

        $user = self::user();
        if ($user === null) {
            self::error(401, 'Veuillez vous connecter pour accéder à cette ressource');
            return false;
        }

        if ($permission !== null && isset($permission['any'])) {
            foreach ($permission['any'] as $candidate) {
                if (PermissionService::can($user, $candidate['resource'], $candidate['action'])) {
                    return self::validateCsrfTokenForMethod($method);
                }
            }
            self::error(403, 'Vous ne possédez aucun des droits requis pour cette action');
            return false;
        }

        if ($permission !== null && PermissionService::isAdminOnly($permission['resource'], $permission['action']) && $user['role'] !== 'admin') {
            self::error(403, 'Cette action est réservée aux administrateurs');
            return false;
        }

        if ($permission !== null && !PermissionService::can($user, $permission['resource'], $permission['action'])) {
            self::error(403, 'Vous ne possédez pas le droit « ' . ($permission['label'] ?? $permission['resource'] . ':' . $permission['action']) . ' »');
            return false;
        }

        return self::validateCsrfTokenForMethod($method);
    }

    public static function csrfToken(): string
    {
        self::startSession();
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    private static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_name('gestion_soutenances_session');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }

    private static function hasValidCsrfToken(): bool
    {
        self::startSession();
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        return is_string($token) && isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    private static function validateCsrfTokenForMethod(string $method): bool
    {
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true) || self::hasValidCsrfToken()) {
            return true;
        }

        self::error(419, 'Jeton de sécurité invalide ou expiré. Rechargez la page puis réessayez.');
        return false;
    }

    private static function withPermissions(array $user): array
    {
        $user['permissions'] = $user['role'] === 'admin' ? [] : PermissionService::codesForUser((int) $user['id']);
        return $user;
    }

    private static function error(int $status, string $message): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    }
}
