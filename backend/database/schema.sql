CREATE DATABASE IF NOT EXISTS gestion_soutenances
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_soutenances;

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
