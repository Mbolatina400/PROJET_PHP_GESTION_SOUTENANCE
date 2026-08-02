<?php

declare(strict_types=1);

class Etablissement
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function get(): array
    {
        try {
            $row = $this->pdo->query('SELECT * FROM etablissement WHERE id = 1')->fetch();
            return $row ? [...$row, 'is_configured' => true] : $this->defaults();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function save(array $data): array
    {
        try {
            $statement = $this->pdo->prepare(
                'INSERT INTO etablissement (id, nom, sigle, faculte, adresse, ville, telephone, email, site_web)
                 VALUES (1, :nom, :sigle, :faculte, :adresse, :ville, :telephone, :email, :site_web)
                 ON DUPLICATE KEY UPDATE nom = VALUES(nom), sigle = VALUES(sigle), faculte = VALUES(faculte),
                 adresse = VALUES(adresse), ville = VALUES(ville), telephone = VALUES(telephone),
                 email = VALUES(email), site_web = VALUES(site_web)'
            );
            foreach (['nom', 'sigle', 'faculte', 'adresse', 'ville', 'telephone', 'email', 'site_web'] as $field) {
                $statement->bindValue(':' . $field, $data[$field] ?? null);
            }
            $statement->execute();
            return $this->get();
        } catch (PDOException $exception) {
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        }
    }

    public function saveLogoPath(string $path): array
    {
        try {
            $this->pdo->beginTransaction();
            $current = $this->pdo->query('SELECT logo_path FROM etablissement WHERE id = 1 FOR UPDATE')->fetch();
            if (!$current) {
                throw new RuntimeException('Enregistrez d’abord les informations de l’établissement avant d’importer un logo');
            }

            $statement = $this->pdo->prepare('UPDATE etablissement SET logo_path = :logo_path WHERE id = 1');
            $statement->execute([':logo_path' => $path]);
            $this->pdo->commit();

            return ['etablissement' => $this->get(), 'previous_logo_path' => $current['logo_path']];
        } catch (PDOException $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    public function removeLogo(): array
    {
        try {
            $this->pdo->beginTransaction();
            $current = $this->pdo->query('SELECT logo_path FROM etablissement WHERE id = 1 FOR UPDATE')->fetch();
            if (!$current) {
                throw new RuntimeException('La configuration de l’établissement est introuvable');
            }

            $this->pdo->exec('UPDATE etablissement SET logo_path = NULL WHERE id = 1');
            $this->pdo->commit();

            return ['etablissement' => $this->get(), 'previous_logo_path' => $current['logo_path']];
        } catch (PDOException $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw new RuntimeException($exception->getMessage(), 0, $exception);
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    public function isLogoPathInUse(string $path): bool
    {
        $statement = $this->pdo->prepare('SELECT COUNT(*) FROM etablissement WHERE logo_path = :logo_path');
        $statement->execute([':logo_path' => $path]);
        return (int) $statement->fetchColumn() > 0;
    }

    private function defaults(): array
    {
        return ['id' => 1, 'nom' => '', 'sigle' => '', 'faculte' => '', 'adresse' => '', 'ville' => '', 'telephone' => '', 'email' => '', 'site_web' => '', 'logo_path' => null, 'is_configured' => false];
    }
}
