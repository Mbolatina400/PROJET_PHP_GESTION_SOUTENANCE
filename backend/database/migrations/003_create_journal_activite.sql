CREATE TABLE IF NOT EXISTS journal_activite (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    utilisateur_id INT UNSIGNED NULL,
    username VARCHAR(50) NULL,
    action VARCHAR(10) NOT NULL,
    chemin VARCHAR(255) NOT NULL,
    details TEXT NULL,
    adresse_ip VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_journal_created_at (created_at),
    INDEX idx_journal_utilisateur (utilisateur_id),
    CONSTRAINT fk_journal_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;
