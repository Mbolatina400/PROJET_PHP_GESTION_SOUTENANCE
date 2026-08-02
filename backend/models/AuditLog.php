<?php

declare(strict_types=1);

class AuditLog
{
    private static bool $recordedForRequest = false;

    public static function recent(int $limit = 100): array
    {
        $statement = Database::getConnection()->prepare('SELECT username, action, chemin, details, adresse_ip, created_at FROM journal_activite ORDER BY id DESC LIMIT :limit');
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();
        return $statement->fetchAll();
    }

    public static function record(?array $user, string $method, string $path, ?string $details = null): void
    {
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true) || self::$recordedForRequest) {
            return;
        }
        try {
            $statement = Database::getConnection()->prepare('INSERT INTO journal_activite (utilisateur_id, username, action, chemin, details, adresse_ip) VALUES (:utilisateur_id, :username, :action, :chemin, :details, :adresse_ip)');
            $statement->execute([
                ':utilisateur_id' => $user['id'] ?? null, ':username' => $user['username'] ?? null,
                ':action' => $method, ':chemin' => $path, ':details' => $details, ':adresse_ip' => $_SERVER['REMOTE_ADDR'] ?? null,
            ]);
            self::$recordedForRequest = $details !== null;
        } catch (Throwable $exception) {
            error_log('[AUDIT] ' . $exception->getMessage());
        }
    }

    public static function recordPermissionChange(array $admin, array $target, array $added, array $removed): void
    {
        $format = static fn (array $permissions): string => implode(', ', array_map(
            static fn (array $permission): string => ($permission['code'] ?? '') . (empty($permission['label']) ? '' : ' (' . $permission['label'] . ')'),
            $permissions
        ));
        $details = sprintf(
            'Droits de %s (ID %d) — ajoutés: %s; retirés: %s.',
            $target['username'],
            (int) $target['id'],
            $added === [] ? 'aucun' : $format($added),
            $removed === [] ? 'aucun' : $format($removed)
        );
        self::record($admin, 'PUT', '/api/utilisateurs/' . (int) $target['id'] . '/permissions', $details);
    }
}
