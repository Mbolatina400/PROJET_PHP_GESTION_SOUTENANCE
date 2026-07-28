# SPÉCIFICATIONS COMPLÈTES — BACKEND
## Application de Gestion des Soutenances (PHP / MVC / API REST)

---

## 1. CONTEXTE ET OBJECTIF

Développer une **API REST en PHP 8.x, architecture MVC**, pour une application de gestion des soutenances de fin d'études (étudiants, professeurs, organismes d'accueil, sessions de soutenance avec jury et notes). Cette API sera consommée par un frontend React séparé.

---

## 2. STACK TECHNIQUE

- PHP 8.x, sans framework (MVC "fait main")
- PDO + MySQL (requêtes préparées obligatoires, jamais de concaténation SQL)
- Dompdf (via Composer) pour la génération du procès-verbal en PDF
- API REST en JSON, CORS activé pour `http://localhost:3000` (frontend React)
- Base de données : `gestion_soutenances` (schéma complet en section 3)

---

## 3. SCHÉMA DE BASE DE DONNÉES (à exécuter avant le développement)

```sql
DROP DATABASE IF EXISTS gestion_soutenances;
CREATE DATABASE gestion_soutenances CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_soutenances;

CREATE TABLE etudiant (
    matricule   VARCHAR(20)  NOT NULL,
    nom         VARCHAR(100) NOT NULL,
    prenoms     VARCHAR(150) NOT NULL,
    niveau      ENUM('L1','L2','L3','M1','M2') NOT NULL,
    parcours    ENUM('GB','SR','IG') NOT NULL,
    adr_email   VARCHAR(150) NULL,
    PRIMARY KEY (matricule),
    INDEX idx_etudiant_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE professeur (
    idprof      VARCHAR(20)  NOT NULL,
    nom         VARCHAR(100) NOT NULL,
    prenoms     VARCHAR(150) NOT NULL,
    civilite    ENUM('Mr','Mlle','Mme') NOT NULL,
    grade       VARCHAR(100) NOT NULL,
    PRIMARY KEY (idprof),
    INDEX idx_professeur_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE organisme (
    idorg       INT NOT NULL AUTO_INCREMENT,
    design      VARCHAR(150) NOT NULL,
    lieu        VARCHAR(150) NOT NULL,
    PRIMARY KEY (idorg)
) ENGINE=InnoDB;

CREATE TABLE soutenir (
    id_soutenance     INT NOT NULL AUTO_INCREMENT,
    matricule         VARCHAR(20)  NOT NULL,
    idorg             INT          NOT NULL,
    annee_univ        VARCHAR(9)   NOT NULL,            -- format : 2022-2023
    note              TINYINT UNSIGNED NOT NULL,         -- 0 à 20
    president         VARCHAR(20)  NOT NULL,
    examinateur       VARCHAR(20)  NOT NULL,
    rapporteur_int    VARCHAR(20)  NOT NULL,
    rapporteur_ext    VARCHAR(20)  NULL,
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

-- Jeu de données de test
INSERT INTO professeur (idprof, nom, prenoms, civilite, grade) VALUES
('PROF001', 'RATIARSON', 'Venot', 'Mr', 'Maître de Conférences'),
('PROF002', 'RALAIVAO', 'Jean Christian', 'Mr', 'Assistant d\'Enseignement Supérieur et de Recherche'),
('PROF003', 'RATIANANTITRA', 'Volatiana Marielle', 'Mlle', 'Maître de Conférences'),
('PROF004', 'HARIJAONA', 'José', 'Mr', 'Docteur en Informatique'),
('PROF005', 'RABE', 'Hary Nivo', 'Mme', 'Professeur titulaire');

INSERT INTO organisme (design, lieu) VALUES
('Université d\'Antananarivo - Mention Informatique', 'Ankatso, Antananarivo'),
('OrangeMada', 'Ankorondrano, Antananarivo'),
('Telma', 'Andraharo, Antananarivo');

INSERT INTO etudiant (matricule, nom, prenoms, niveau, parcours, adr_email) VALUES
('ET001', 'RAKOTO', 'Gilbert', 'L3', 'IG', 'rakoto.gilbert@example.com'),
('ET002', 'RASOA', 'Marie', 'L3', 'SR', 'rasoa.marie@example.com'),
('ET003', 'RABE', 'Nicolas', 'M1', 'GB', 'rabe.nicolas@example.com'),
('ET004', 'RAZAFY', 'Hanta', 'M2', 'IG', 'razafy.hanta@example.com'),
('ET005', 'ANDRY', 'Tahina', 'L3', 'IG', 'andry.tahina@example.com');

INSERT INTO soutenir (matricule, idorg, annee_univ, note, president, examinateur, rapporteur_int, rapporteur_ext) VALUES
('ET001', 1, '2022-2023', 18, 'PROF001', 'PROF002', 'PROF003', 'PROF004'),
('ET002', 2, '2022-2023', 15, 'PROF005', 'PROF001', 'PROF003', NULL);
-- ET003, ET004, ET005 n'ont pas encore de soutenance => utiles pour tester "étudiants non soutenus"
```

---

## 4. ARBORESCENCE DU BACKEND À GÉNÉRER

```
backend/
├── public/index.php          (front controller, point d'entrée unique)
├── core/Router.php           (routeur simple basé sur REQUEST_METHOD + REQUEST_URI)
├── core/Database.php         (singleton de connexion PDO)
├── core/Controller.php       (classe abstraite : jsonResponse(), getBody(), etc.)
├── config/database.php       (paramètres de connexion, via variables d'environnement)
├── models/Etudiant.php
├── models/Professeur.php
├── models/Organisme.php
├── models/Soutenir.php
├── controllers/EtudiantController.php
├── controllers/ProfesseurController.php
├── controllers/OrganismeController.php
├── controllers/SoutenirController.php
├── views/pdf/proces_verbal_template.php
├── helpers/PdfGenerator.php
├── routes/api.php
├── composer.json
└── .env.example
```

---

## 5. FONCTIONNALITÉS ET ENDPOINTS À IMPLÉMENTER

### 5.1 CRUD complet (9 pts) — sur etudiant, professeur, organisme, soutenir
- `GET /api/{ressource}` → liste tout
- `GET /api/{ressource}/{id}` → un seul élément
- `POST /api/{ressource}` → création (valider les champs obligatoires + valeurs ENUM)
- `PUT /api/{ressource}/{id}` → modification
- `DELETE /api/{ressource}/{id}` → suppression

### 5.2 Recherche d'étudiant (1 pt)
`GET /api/etudiants/recherche?q=valeur`
→ requête SQL avec `LIKE '%valeur%'` sur `matricule` OU `nom`

### 5.3 Liste par niveau + effectif (2 pts)
- `GET /api/etudiants/par-niveau?niveau=L3` → étudiants du niveau + total
- `GET /api/etudiants/effectifs` → comptage groupé par niveau (`GROUP BY niveau`)

### 5.4 Génération automatique du procès-verbal en PDF (5 pts)
`GET /api/soutenances/{id}/pv`
→ récupère la soutenance + l'étudiant + les 4 professeurs du jury (jointures), génère un PDF avec Dompdf et le retourne en téléchargement (`Content-Type: application/pdf`), reprenant :
- Titre "PROCES VERBAL", mention/parcours, nom complet de l'étudiant
- Phrase "a soutenu publiquement son mémoire de fin d'études..."
- Note attribuée (en chiffres et en lettres)
- Membres du jury avec civilité, nom, grade (Président, Examinateur, Rapporteur interne, Rapporteur externe)

### 5.5 Notes entre deux dates (2 pts)
`GET /api/soutenances/notes?debut=2021-2022&fin=2023-2024`
→ liste des étudiants ayant soutenu dans cette plage d'années universitaires, avec leur note

### 5.6 Étudiants n'ayant pas soutenu (1 pt)
`GET /api/etudiants/non-soutenus`
→ `LEFT JOIN etudiant/soutenir` où `soutenir.matricule IS NULL`

---

## 6. EXIGENCES TECHNIQUES

- Toutes les requêtes SQL en requêtes préparées PDO (`bindParam`/`bindValue`) — aucune injection possible
- Réponses JSON uniformes : `{ "success": true, "data": ... }` ou `{ "success": false, "error": "message" }`
- Codes HTTP corrects (200, 201, 400, 404, 409, 500)
- Validation des champs obligatoires et des valeurs ENUM côté backend avant insertion
- `try/catch` sur chaque appel PDO, gestion propre des erreurs
- En-têtes CORS activés (`Access-Control-Allow-Origin`, `-Methods`, `-Headers`) pour les appels depuis React
- Code commenté, noms de variables clairs, séparation stricte Modèle / Contrôleur / Route

---

## 7. LIVRABLE ATTENDU

Générer tous les fichiers listés dans l'arborescence (section 4) avec leur contenu complet et fonctionnel, prêts à être testés avec Postman/Insomnia ou consommés directement par un frontend React.
