<?php

declare(strict_types=1);

class Utilisateur
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findByUsername(string $username): ?array
    {
        $statement = $this->pdo->prepare('SELECT * FROM utilisateurs WHERE username = :username LIMIT 1');
        $statement->execute([':username' => $username]);
        return $statement->fetch() ?: null;
    }

    public function findActiveById(int $id): ?array
    {
        $statement = $this->pdo->prepare('SELECT id, username, email, nom, role, actif FROM utilisateurs WHERE id = :id AND actif = 1 LIMIT 1');
        $statement->execute([':id' => $id]);
        return $statement->fetch() ?: null;
    }

    public function all(): array
    {
        return $this->pdo->query('SELECT id, username, email, nom, role, actif, created_at, updated_at FROM utilisateurs ORDER BY username')->fetchAll();
    }

    public function create(array $data): array
    {
        $statement = $this->pdo->prepare('INSERT INTO utilisateurs (username, email, nom, password_hash, role, actif) VALUES (:username, :email, :nom, :password_hash, :role, :actif)');
        $statement->execute([
            ':username' => $data['username'], ':email' => $data['email'], ':nom' => $data['nom'],
            ':password_hash' => password_hash($data['password'], PASSWORD_DEFAULT), ':role' => $data['role'], ':actif' => $data['actif'],
        ]);
        return $this->findById((int) $this->pdo->lastInsertId());
    }

    public function update(int $id, array $data): ?array
    {
        $sql = 'UPDATE utilisateurs SET username = :username, email = :email, nom = :nom, role = :role, actif = :actif';
        $params = [':id' => $id, ':username' => $data['username'], ':email' => $data['email'], ':nom' => $data['nom'], ':role' => $data['role'], ':actif' => $data['actif']];
        if (!empty($data['password'])) {
            $sql .= ', password_hash = :password_hash';
            $params[':password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        $statement = $this->pdo->prepare($sql . ' WHERE id = :id');
        $statement->execute($params);
        return $this->findById($id);
    }

    public function updatePassword(int $id, string $password): void
    {
        $statement = $this->pdo->prepare('UPDATE utilisateurs SET password_hash = :password_hash WHERE id = :id');
        $statement->execute([':id' => $id, ':password_hash' => password_hash($password, PASSWORD_DEFAULT)]);
    }

    public function countActiveAdmins(): int
    {
        return (int) $this->pdo->query("SELECT COUNT(*) FROM utilisateurs WHERE role = 'admin' AND actif = 1")->fetchColumn();
    }

    public function findById(int $id): ?array
    {
        $statement = $this->pdo->prepare('SELECT id, username, email, nom, role, actif, created_at, updated_at FROM utilisateurs WHERE id = :id');
        $statement->execute([':id' => $id]);
        return $statement->fetch() ?: null;
    }
}
