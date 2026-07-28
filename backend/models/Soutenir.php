<?php

declare(strict_types=1);

class Soutenir
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function all(): array
    {
        try {
            return $this->pdo
                ->query(
                    'SELECT s.*, e.nom AS etudiant_nom, e.prenoms AS etudiant_prenoms, o.design AS organisme
                     FROM soutenir s
                     INNER JOIN etudiant e ON e.matricule = s.matricule
                     INNER JOIN organisme o ON o.idorg = s.idorg
                     ORDER BY s.annee_univ DESC, e.nom'
                )
                ->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function find(int $id): ?array
    {
        try {
            $statement = $this->pdo->prepare('SELECT * FROM soutenir WHERE id_soutenance = :id');
            $statement->bindValue(':id', $id, PDO::PARAM_INT);
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
            $statement = $this->pdo->prepare(
                'INSERT INTO soutenir
                 (matricule, idorg, annee_univ, note, president, examinateur, rapporteur_int, rapporteur_ext)
                 VALUES
                 (:matricule, :idorg, :annee_univ, :note, :president, :examinateur, :rapporteur_int, :rapporteur_ext)'
            );
            $this->bindSoutenance($statement, $data);
            $statement->execute();
            return (int) $this->pdo->lastInsertId();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function update(int $id, array $data): bool
    {
        try {
            $statement = $this->pdo->prepare(
                'UPDATE soutenir
                 SET matricule = :matricule, idorg = :idorg, annee_univ = :annee_univ, note = :note,
                     president = :president, examinateur = :examinateur,
                     rapporteur_int = :rapporteur_int, rapporteur_ext = :rapporteur_ext
                 WHERE id_soutenance = :id'
            );
            $statement->bindValue(':id', $id, PDO::PARAM_INT);
            $this->bindSoutenance($statement, $data);
            $statement->execute();
            return $statement->rowCount() > 0 || $this->find($id) !== null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $statement = $this->pdo->prepare('DELETE FROM soutenir WHERE id_soutenance = :id');
            $statement->bindValue(':id', $id, PDO::PARAM_INT);
            $statement->execute();
            return $statement->rowCount() > 0;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function notesBetween(string $debut, string $fin): array
    {
        try {
            $statement = $this->pdo->prepare(
                'SELECT e.matricule, e.nom, e.prenoms, e.niveau, e.parcours, s.annee_univ, s.note
                 FROM soutenir s
                 INNER JOIN etudiant e ON e.matricule = s.matricule
                 WHERE s.annee_univ BETWEEN :debut AND :fin
                 ORDER BY s.annee_univ, e.nom, e.prenoms'
            );
            $statement->bindValue(':debut', $debut);
            $statement->bindValue(':fin', $fin);
            $statement->execute();
            return $statement->fetchAll();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function procesVerbalData(int $id): ?array
    {
        try {
            $statement = $this->pdo->prepare(
                'SELECT
                    s.id_soutenance, s.annee_univ, s.note,
                    e.matricule, e.nom AS etudiant_nom, e.prenoms AS etudiant_prenoms,
                    e.niveau, e.parcours,
                    o.design AS organisme_design, o.lieu AS organisme_lieu,
                    pres.civilite AS president_civilite, pres.nom AS president_nom, pres.grade AS president_grade,
                    exam.civilite AS examinateur_civilite, exam.nom AS examinateur_nom, exam.grade AS examinateur_grade,
                    rint.civilite AS rapporteur_int_civilite, rint.nom AS rapporteur_int_nom, rint.grade AS rapporteur_int_grade,
                    rext.civilite AS rapporteur_ext_civilite, rext.nom AS rapporteur_ext_nom, rext.grade AS rapporteur_ext_grade
                 FROM soutenir s
                 INNER JOIN etudiant e ON e.matricule = s.matricule
                 INNER JOIN organisme o ON o.idorg = s.idorg
                 INNER JOIN professeur pres ON pres.idprof = s.president
                 INNER JOIN professeur exam ON exam.idprof = s.examinateur
                 INNER JOIN professeur rint ON rint.idprof = s.rapporteur_int
                 LEFT JOIN professeur rext ON rext.idprof = s.rapporteur_ext
                 WHERE s.id_soutenance = :id'
            );
            $statement->bindValue(':id', $id, PDO::PARAM_INT);
            $statement->execute();
            $result = $statement->fetch();
            return $result ?: null;
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    private function bindSoutenance(PDOStatement $statement, array $data): void
    {
        $rapporteurExt = $data['rapporteur_ext'] ?? null;
        if ($rapporteurExt === '') {
            $rapporteurExt = null;
        }

        $statement->bindValue(':matricule', $data['matricule']);
        $statement->bindValue(':idorg', (int) $data['idorg'], PDO::PARAM_INT);
        $statement->bindValue(':annee_univ', $data['annee_univ']);
        $statement->bindValue(':note', (int) $data['note'], PDO::PARAM_INT);
        $statement->bindValue(':president', $data['president']);
        $statement->bindValue(':examinateur', $data['examinateur']);
        $statement->bindValue(':rapporteur_int', $data['rapporteur_int']);
        $statement->bindValue(':rapporteur_ext', $rapporteurExt);
    }
}
