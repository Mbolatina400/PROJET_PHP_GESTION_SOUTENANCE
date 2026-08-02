<?php

declare(strict_types=1);

class Etudiant
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function all(): array
    {
        try {
            return $this->pdo->query('SELECT * FROM etudiant ORDER BY nom, prenoms')->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function find(string $matricule): ?array
    {
        try {
            $statement = $this->pdo->prepare('SELECT * FROM etudiant WHERE matricule = :matricule');
            $statement->bindValue(':matricule', $matricule);
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
                'INSERT INTO etudiant (matricule, nom, prenoms, niveau, parcours, adr_email)
                 VALUES (:matricule, :nom, :prenoms, :niveau, :parcours, :adr_email)'
            );
            $statement->bindValue(':matricule', $data['matricule']);
            $statement->bindValue(':nom', $data['nom']);
            $statement->bindValue(':prenoms', $data['prenoms']);
            $statement->bindValue(':niveau', $data['niveau']);
            $statement->bindValue(':parcours', $data['parcours']);
            $statement->bindValue(':adr_email', $data['adr_email'] ?? null);
            return $statement->execute();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function update(string $matricule, array $data): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'UPDATE etudiant
                 SET nom = :nom, prenoms = :prenoms, niveau = :niveau, parcours = :parcours, adr_email = :adr_email
                 WHERE matricule = :matricule'
            );
            $statement->bindValue(':matricule', $matricule);
            $statement->bindValue(':nom', $data['nom']);
            $statement->bindValue(':prenoms', $data['prenoms']);
            $statement->bindValue(':niveau', $data['niveau']);
            $statement->bindValue(':parcours', $data['parcours']);
            $statement->bindValue(':adr_email', $data['adr_email'] ?? null);
            $statement->execute();
            return $statement->rowCount() > 0 || $this->find($matricule) !== null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function delete(string $matricule): bool
    {
        try {
            $statement = $this->pdo->prepare('DELETE FROM etudiant WHERE matricule = :matricule');
            $statement->bindValue(':matricule', $matricule);
            $statement->execute();
            return $statement->rowCount() > 0;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function aSoutenu(string $matricule): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'SELECT 1 FROM soutenir WHERE matricule = :matricule LIMIT 1'
            );
            $statement->bindValue(':matricule', $matricule);
            $statement->execute();
            return $statement->fetchColumn() !== false;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function search(string $query): array
    {
        try {
            $statement = $this->pdo->prepare(
                'SELECT * FROM etudiant
                 WHERE matricule LIKE :matricule_query OR nom LIKE :nom_query
                 ORDER BY nom, prenoms'
            );
            $statement->bindValue(':matricule_query', '%' . $query . '%');
            $statement->bindValue(':nom_query', '%' . $query . '%');
            $statement->execute();
            return $statement->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function byNiveau(string $niveau): array
    {
        try {
            $statement = $this->pdo->prepare('SELECT * FROM etudiant WHERE niveau = :niveau ORDER BY nom, prenoms');
            $statement->bindValue(':niveau', $niveau);
            $statement->execute();
            $students = $statement->fetchAll();
            return ['total' => count($students), 'etudiants' => $students];
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function reportByNiveau(string $niveau): array
    {
        try {
            $statement = $this->pdo->prepare(
                'SELECT matricule, nom, prenoms, niveau, parcours
                 FROM etudiant WHERE niveau = :niveau ORDER BY nom, prenoms'
            );
            $statement->execute([':niveau' => $niveau]);
            $students = $statement->fetchAll();
            return ['total' => count($students), 'etudiants' => $students];
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function effectifs(): array
    {
        try {
            return $this->pdo
                ->query('SELECT niveau, COUNT(*) AS total FROM etudiant GROUP BY niveau ORDER BY niveau')
                ->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function nonSoutenus(): array
    {
        try {
            return $this->pdo
                ->query(
                    'SELECT e.matricule, e.nom, e.prenoms, e.niveau, e.parcours
                     FROM etudiant e
                     LEFT JOIN soutenir s ON s.matricule = e.matricule
                     WHERE s.matricule IS NULL
                     ORDER BY e.nom, e.prenoms'
                )
                ->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }
}
