<?php

declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $config = require dirname(__DIR__) . '/config/database.php';
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );

            self::$instance = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5,
            ]);
        }

        return self::$instance;
    }

    public static function health(): array
    {
        try {
            self::getConnection()->query('SELECT 1');
            return ['connected' => true];
        } catch (PDOException $exception) {
            return [
                'connected' => false,
                'reason' => self::connectionErrorMessage($exception),
            ];
        }
    }

    public static function isConnectionException(Throwable $exception): bool
    {
        return str_contains($exception->getMessage(), '2002')
            || str_contains($exception->getMessage(), '2006')
            || str_contains($exception->getMessage(), '1045')
            || str_contains($exception->getMessage(), '1698');
    }

    public static function connectionErrorMessage(Throwable $exception): string
    {
        if (str_contains($exception->getMessage(), '1045') || str_contains($exception->getMessage(), '1698')) {
            return 'Identifiants MySQL refusés. Créez un utilisateur dédié pour l’application et renseignez-le dans backend/.env.';
        }

        return 'Le serveur MySQL/MariaDB est inaccessible.';
    }
}
