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
3. Lancez l'API depuis le dossier `backend` :

   ```bash
   php -S 127.0.0.1:8000 -t public
   ```

4. Vérifiez la connexion avec `http://127.0.0.1:8000/api/health/database`.

La route répond `200` si MySQL est joignable, ou `503` avec une explication sans exposer le mot de passe.
