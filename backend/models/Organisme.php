<?php

declare(strict_types=1);

class Organisme
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function all(): array
    {
        try {
            return $this->pdo->query('SELECT * FROM organisme ORDER BY design')->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function find(int $idorg): ?array
    {
        try {
            $statement = $this->pdo->prepare('SELECT * FROM organisme WHERE idorg = :idorg');
            $statement->bindValue(':idorg', $idorg, PDO::PARAM_INT);
            $statement->execute();
            $result = $statement->fetch();
            return $result ?: null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function create(array $data): int
    {
        try {
            $statement = $this->pdo->prepare('INSERT INTO organisme (design, lieu) VALUES (:design, :lieu)');
            $statement->bindValue(':design', $data['design']);
            $statement->bindValue(':lieu', $data['lieu']);
            $statement->execute();
            return (int) $this->pdo->lastInsertId();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function update(int $idorg, array $data): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'UPDATE organisme SET design = :design, lieu = :lieu WHERE idorg = :idorg'
            );
            $statement->bindValue(':idorg', $idorg, PDO::PARAM_INT);
            $statement->bindValue(':design', $data['design']);
            $statement->bindValue(':lieu', $data['lieu']);
            $statement->execute();
            return $statement->rowCount() > 0 || $this->find($idorg) !== null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function delete(int $idorg): bool
    {
        try {
            $statement = $this->pdo->prepare('DELETE FROM organisme WHERE idorg = :idorg');
            $statement->bindValue(':idorg', $idorg, PDO::PARAM_INT);
            $statement->execute();
            return $statement->rowCount() > 0;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function aDejaAccueilliSoutenance(int $idorg): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'SELECT 1 FROM soutenir WHERE idorg = :idorg LIMIT 1'
            );
            $statement->bindValue(':idorg', $idorg, PDO::PARAM_INT);
            $statement->execute();
            return $statement->fetchColumn() !== false;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }
}
