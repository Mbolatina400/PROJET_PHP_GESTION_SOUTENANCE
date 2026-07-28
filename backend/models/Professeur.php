<?php

declare(strict_types=1);

class Professeur
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function all(): array
    {
        try {
            return $this->pdo->query('SELECT * FROM professeur ORDER BY nom, prenoms')->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function find(string $idprof): ?array
    {
        try {
            $statement = $this->pdo->prepare('SELECT * FROM professeur WHERE idprof = :idprof');
            $statement->bindValue(':idprof', $idprof);
            $statement->execute();
            $result = $statement->fetch();
            return $result ?: null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function create(array $data): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'INSERT INTO professeur (idprof, nom, prenoms, civilite, grade)
                 VALUES (:idprof, :nom, :prenoms, :civilite, :grade)'
            );
            $statement->bindValue(':idprof', $data['idprof']);
            $statement->bindValue(':nom', $data['nom']);
            $statement->bindValue(':prenoms', $data['prenoms']);
            $statement->bindValue(':civilite', $data['civilite']);
            $statement->bindValue(':grade', $data['grade']);
            return $statement->execute();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function update(string $idprof, array $data): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'UPDATE professeur
                 SET nom = :nom, prenoms = :prenoms, civilite = :civilite, grade = :grade
                 WHERE idprof = :idprof'
            );
            $statement->bindValue(':idprof', $idprof);
            $statement->bindValue(':nom', $data['nom']);
            $statement->bindValue(':prenoms', $data['prenoms']);
            $statement->bindValue(':civilite', $data['civilite']);
            $statement->bindValue(':grade', $data['grade']);
            $statement->execute();
            return $statement->rowCount() > 0 || $this->find($idprof) !== null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function delete(string $idprof): bool
    {
        try {
            $statement = $this->pdo->prepare('DELETE FROM professeur WHERE idprof = :idprof');
            $statement->bindValue(':idprof', $idprof);
            $statement->execute();
            return $statement->rowCount() > 0;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function estMembreJury(string $idprof): bool
    {
        try {
            $statement = $this->pdo->prepare(
                 'SELECT 1
                 FROM soutenir
                 WHERE president = :president
                    OR examinateur = :examinateur
                    OR rapporteur_int = :rapporteur_int
                    OR rapporteur_ext = :rapporteur_ext
                 LIMIT 1'
            );
            $statement->bindValue(':president', $idprof);
            $statement->bindValue(':examinateur', $idprof);
            $statement->bindValue(':rapporteur_int', $idprof);
            $statement->bindValue(':rapporteur_ext', $idprof);
            $statement->execute();
            return $statement->fetchColumn() !== false;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }
}
