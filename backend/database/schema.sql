CREATE DATABASE IF NOT EXISTS gestion_soutenances
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_soutenances;

CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    nom VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'utilisateur') NOT NULL DEFAULT 'utilisateur',
    actif TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_utilisateurs_username (username),
    UNIQUE KEY uq_utilisateurs_email (email)
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS permissions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    label VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_permissions_code (code),
    UNIQUE KEY uq_permissions_resource_action (resource, action)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utilisateur_permissions (
    utilisateur_id INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (utilisateur_id, permission_id),
    CONSTRAINT fk_utilisateur_permissions_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    CONSTRAINT fk_utilisateur_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS etudiant (
    matricule VARCHAR(20) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(150) NOT NULL,
    niveau ENUM('L1', 'L2', 'L3', 'M1', 'M2') NOT NULL,
    parcours ENUM('GB', 'SR', 'IG') NOT NULL,
    adr_email VARCHAR(150) NULL,
    PRIMARY KEY (matricule),
    INDEX idx_etudiant_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professeur (
    idprof VARCHAR(20) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(150) NOT NULL,
    civilite ENUM('Mr', 'Mlle', 'Mme') NOT NULL,
    grade VARCHAR(100) NOT NULL,
    PRIMARY KEY (idprof),
    INDEX idx_professeur_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS organisme (
    idorg INT NOT NULL AUTO_INCREMENT,
    design VARCHAR(150) NOT NULL,
    lieu VARCHAR(150) NOT NULL,
    PRIMARY KEY (idorg)
) ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS soutenir (
    id_soutenance INT NOT NULL AUTO_INCREMENT,
    matricule VARCHAR(20) NOT NULL,
    idorg INT NOT NULL,
    annee_univ VARCHAR(9) NOT NULL,
    note TINYINT UNSIGNED NOT NULL,
    president VARCHAR(20) NOT NULL,
    examinateur VARCHAR(20) NOT NULL,
    rapporteur_int VARCHAR(20) NOT NULL,
    rapporteur_ext VARCHAR(20) NULL,
    PRIMARY KEY (id_soutenance),
    CONSTRAINT chk_note CHECK (note BETWEEN 0 AND 20),
    CONSTRAINT chk_annee_univ CHECK (annee_univ REGEXP '^[0-9]{4}-[0-9]{4}$'),
    CONSTRAINT fk_soutenir_etudiant FOREIGN KEY (matricule) REFERENCES etudiant(matricule) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_soutenir_organisme FOREIGN KEY (idorg) REFERENCES organisme(idorg) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_soutenir_president FOREIGN KEY (president) REFERENCES professeur(idprof) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_soutenir_examinateur FOREIGN KEY (examinateur) REFERENCES professeur(idprof) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_soutenir_rapp_int FOREIGN KEY (rapporteur_int) REFERENCES professeur(idprof) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_soutenir_rapp_ext FOREIGN KEY (rapporteur_ext) REFERENCES professeur(idprof) ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_etudiant_annee (matricule, annee_univ),
    INDEX idx_soutenir_annee (annee_univ)
) ENGINE=InnoDB;
