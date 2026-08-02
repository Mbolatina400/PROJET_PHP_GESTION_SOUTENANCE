<?php

declare(strict_types=1);

class LoginRateLimiter
{
    private const MAX_ATTEMPTS = 5;
    private const WINDOW_SECONDS = 900;

    public static function retryAfter(string $username): int
    {
        $attempts = self::attempts($username);
        $now = time();
        $recent = array_values(array_filter($attempts, static fn (int $timestamp): bool => $timestamp > $now - self::WINDOW_SECONDS));
        if (count($recent) < self::MAX_ATTEMPTS) {
            return 0;
        }
        return max(1, self::WINDOW_SECONDS - ($now - min($recent)));
    }

    public static function recordFailure(string $username): void
    {
        $attempts = self::attempts($username);
        $now = time();
        $attempts[] = $now;
        self::write(array_values(array_filter($attempts, static fn (int $timestamp): bool => $timestamp > $now - self::WINDOW_SECONDS)), $username);
    }

    public static function clear(string $username): void
    {
        $file = self::file($username);
        if (is_file($file)) {
            @unlink($file);
        }
    }

    private static function attempts(string $username): array
    {
        $content = @file_get_contents(self::file($username));
        $data = $content === false ? [] : json_decode($content, true);
        return is_array($data) ? array_map('intval', $data) : [];
    }

    private static function write(array $attempts, string $username): void
    {
        @file_put_contents(self::file($username), json_encode($attempts), LOCK_EX);
    }

    private static function file(string $username): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        return sys_get_temp_dir() . '/gestion-soutenances-login-' . hash('sha256', strtolower($username) . '|' . $ip) . '.json';
    }
}
