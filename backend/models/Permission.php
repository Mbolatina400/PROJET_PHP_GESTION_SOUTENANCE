<?php

declare(strict_types=1);

class Permission
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function all(): array
    {
        return $this->pdo->query('SELECT id, code, resource, action, label FROM permissions ORDER BY resource, id')->fetchAll();
    }

    public function forUser(int $userId): array
    {
        $statement = $this->pdo->prepare('SELECT p.id, p.code, p.resource, p.action, p.label FROM permissions p INNER JOIN utilisateur_permissions up ON up.permission_id = p.id WHERE up.utilisateur_id = :user_id ORDER BY p.resource, p.id');
        $statement->execute([':user_id' => $userId]);
        return $statement->fetchAll();
    }

    public function replaceForUser(int $userId, array $permissionIds): void
    {
        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare('DELETE FROM utilisateur_permissions WHERE utilisateur_id = :user_id')->execute([':user_id' => $userId]);
            if ($permissionIds !== []) {
                $insert = $this->pdo->prepare('INSERT INTO utilisateur_permissions (utilisateur_id, permission_id) VALUES (:user_id, :permission_id)');
                foreach ($permissionIds as $permissionId) {
                    $insert->execute([':user_id' => $userId, ':permission_id' => $permissionId]);
                }
            }
            $this->pdo->commit();
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $exception;
        }
    }
}
