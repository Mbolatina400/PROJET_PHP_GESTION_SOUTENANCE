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
