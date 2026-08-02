CREATE TABLE IF NOT EXISTS etablissement (
    id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    nom VARCHAR(180) NOT NULL,
    sigle VARCHAR(30) NULL,
    faculte VARCHAR(180) NULL,
    adresse VARCHAR(255) NULL,
    ville VARCHAR(100) NULL,
    telephone VARCHAR(50) NULL,
    email VARCHAR(150) NULL,
    site_web VARCHAR(180) NULL,
    logo_path VARCHAR(255) NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_etablissement_singleton CHECK (id = 1)
) ENGINE=InnoDB;
