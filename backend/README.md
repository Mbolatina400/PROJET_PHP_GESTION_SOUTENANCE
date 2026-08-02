# Backend — démarrage local

1. Démarrez MySQL ou MariaDB, puis ouvrez la console d’administration (sur Ubuntu/Debian, `sudo mysql`). Créez la base et un utilisateur dédié — évitez `root`, qui utilise souvent l’authentification système :

   ```sql
   CREATE DATABASE IF NOT EXISTS gestion_soutenances CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'gestion_soutenances_app'@'127.0.0.1' IDENTIFIED BY 'choisissez-un-mot-de-passe-solide';
   GRANT ALL PRIVILEGES ON gestion_soutenances.* TO 'gestion_soutenances_app'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```

   Puis renseignez `DB_USERNAME=gestion_soutenances_app` et son mot de passe dans `.env`.
2. Importez le schéma une fois avec le compte d’administration :

   ```bash
   sudo mysql < database/schema.sql
   ```

   Pour une base existante, appliquez les migrations dans l’ordre :

   ```bash
   mysql -u <user> -p gestion_soutenances < database/migrations/001_create_etablissement.sql
   mysql -u <user> -p gestion_soutenances < database/migrations/002_create_utilisateurs.sql
   mysql -u <user> -p gestion_soutenances < database/migrations/003_create_journal_activite.sql
   mysql -u <user> -p gestion_soutenances < database/migrations/004_create_permissions.sql
   mysql -u <user> -p gestion_soutenances < database/migrations/005_add_journal_activite_details.sql
   ```

   Créez ensuite le premier administrateur sans placer son mot de passe dans un fichier SQL :

   ```bash
   ADMIN_USERNAME='admin' ADMIN_EMAIL='admin@example.com' ADMIN_NAME='Administrateur' ADMIN_PASSWORD='MotDePasseFort12' php scripts/create_admin.php
   ```
3. Lancez l'API depuis le dossier `backend` :

   ```bash
   php -S 127.0.0.1:8000 -t public
   ```

4. Vérifiez la connexion avec `http://127.0.0.1:8000/api/health/database`.

La route répond `200` si MySQL est joignable, ou `503` avec une explication sans exposer le mot de passe.

## Permissions par utilisateur

La migration `004_create_permissions.sql` crée le catalogue statique des permissions et la table pivot `utilisateur_permissions`. Elle est idempotente : elle peut être rejouée sans supprimer les comptes ni les droits déjà attribués. Pour une base existante, appliquez les migrations dans l’ordre `001`, `002`, `003`, puis `004`.

Depuis **Utilisateurs**, un administrateur édite un compte de rôle `utilisateur`, puis coche les droits par ressource : voir, ajouter, modifier ou supprimer. Les droits `utilisateurs`, `journal_activite` et `etablissement:modifier` restent exclusivement administrateur et ne peuvent pas être transmis à un utilisateur standard.

Un administrateur contourne toujours le système de permissions et dispose de tous les droits, sans enregistrement spécifique dans la table pivot. Après l’application de la migration, les utilisateurs existants de rôle `utilisateur` ne possèdent volontairement aucun droit métier tant qu’un administrateur ne les leur a pas attribués.

Le backend est la source de vérité : toutes les routes API métier vérifient la permission requise et répondent `401` sans session ou `403` sans droit. L’interface masque les actions non autorisées uniquement pour améliorer l’expérience utilisateur.

Les rapports utilisent des réponses dédiées et minimales : `effectifs:voir`, `notes:voir`, `non_soutenus:voir` et `soutenances:voir` suffisent chacun à leur écran, sans droit de lecture sur les ressources liées. Les changements de permissions sont conservés dans le journal avec l’administrateur, l’utilisateur cible, ainsi que les droits ajoutés ou retirés.

## Réinitialiser un mot de passe

Le script CLI cible un seul compte par son identifiant et ne journalise ni n’affiche le mot de passe. Préférez un gestionnaire de secrets ou un environnement de processus protégé :

```bash
RESET_USERNAME='admin' RESET_PASSWORD='MotDePasseFort12' php scripts/reset_password.php
```

En terminal interactif, la saisie est masquée :

```bash
php scripts/reset_password.php admin
```

Le mot de passe doit faire au moins 12 caractères et contenir une majuscule, une minuscule et un chiffre.

## Vérifications HTTP d’intégration

`tests/http_authorization_checks.php` exécute les contrôles HTTP sur une API et une base de test isolées. Il ne doit jamais viser la base de production ; son en-tête détaille les comptes et données de test requis.

## Sauvegarde

Le script `scripts/backup_database.sh` crée une sauvegarde compressée et supprime celles de plus de 30 jours. Planifiez-le quotidiennement avec cron, en fournissant `DB_HOST`, `DB_NAME`, `DB_USERNAME` et `MYSQL_PWD` via un environnement protégé.
