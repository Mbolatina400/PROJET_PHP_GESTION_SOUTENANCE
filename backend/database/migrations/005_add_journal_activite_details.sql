-- Migration non destructive et idempotente pour les bases déjà initialisées.
-- La colonne conserve l'historique existant à NULL.
SELECT IF(
    EXISTS(
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'journal_activite' AND COLUMN_NAME = 'details'
    ),
    'SELECT 1',
    'ALTER TABLE journal_activite ADD COLUMN details TEXT NULL AFTER chemin'
) INTO @journal_details_migration;
PREPARE journal_details_statement FROM @journal_details_migration;
EXECUTE journal_details_statement;
DEALLOCATE PREPARE journal_details_statement;
