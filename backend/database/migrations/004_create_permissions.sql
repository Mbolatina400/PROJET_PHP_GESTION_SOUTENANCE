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

INSERT INTO permissions (code, resource, action, label) VALUES
    ('etudiants.voir', 'etudiants', 'voir', 'Voir les étudiants'),
    ('etudiants.ajouter', 'etudiants', 'ajouter', 'Ajouter des étudiants'),
    ('etudiants.modifier', 'etudiants', 'modifier', 'Modifier les étudiants'),
    ('etudiants.supprimer', 'etudiants', 'supprimer', 'Supprimer des étudiants'),
    ('professeurs.voir', 'professeurs', 'voir', 'Voir les professeurs'),
    ('professeurs.ajouter', 'professeurs', 'ajouter', 'Ajouter des professeurs'),
    ('professeurs.modifier', 'professeurs', 'modifier', 'Modifier les professeurs'),
    ('professeurs.supprimer', 'professeurs', 'supprimer', 'Supprimer des professeurs'),
    ('organismes.voir', 'organismes', 'voir', 'Voir les organismes'),
    ('organismes.ajouter', 'organismes', 'ajouter', 'Ajouter des organismes'),
    ('organismes.modifier', 'organismes', 'modifier', 'Modifier les organismes'),
    ('organismes.supprimer', 'organismes', 'supprimer', 'Supprimer des organismes'),
    ('soutenances.voir', 'soutenances', 'voir', 'Voir les soutenances'),
    ('soutenances.ajouter', 'soutenances', 'ajouter', 'Ajouter des soutenances'),
    ('soutenances.modifier', 'soutenances', 'modifier', 'Modifier les soutenances'),
    ('soutenances.supprimer', 'soutenances', 'supprimer', 'Supprimer des soutenances'),
    ('pdf.voir', 'pdf', 'voir', 'Voir et télécharger les procès-verbaux PDF'),
    ('effectifs.voir', 'effectifs', 'voir', 'Voir les effectifs'),
    ('notes.voir', 'notes', 'voir', 'Voir les notes par période'),
    ('non_soutenus.voir', 'non_soutenus', 'voir', 'Voir les étudiants non soutenus'),
    ('etablissement.voir', 'etablissement', 'voir', 'Voir les informations de l’établissement'),
    ('etablissement.modifier', 'etablissement', 'modifier', 'Modifier les informations de l’établissement'),
    ('utilisateurs.voir', 'utilisateurs', 'voir', 'Voir les utilisateurs'),
    ('utilisateurs.ajouter', 'utilisateurs', 'ajouter', 'Ajouter des utilisateurs'),
    ('utilisateurs.modifier', 'utilisateurs', 'modifier', 'Modifier les utilisateurs'),
    ('journal_activite.voir', 'journal_activite', 'voir', 'Voir le journal d’activité')
ON DUPLICATE KEY UPDATE label = VALUES(label), resource = VALUES(resource), action = VALUES(action);
