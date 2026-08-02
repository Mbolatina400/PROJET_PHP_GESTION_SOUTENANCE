<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/models/Utilisateur.php';

$username = trim((string) getenv('ADMIN_USERNAME'));
$email = trim((string) getenv('ADMIN_EMAIL'));
$name = trim((string) getenv('ADMIN_NAME'));
$password = (string) getenv('ADMIN_PASSWORD');

if ($username === '' || $email === '' || $name === '' || $password === '') {
    fwrite(STDERR, "Usage: ADMIN_USERNAME=... ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PASSWORD=... php scripts/create_admin.php\n");
    exit(1);
}
if (!preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $username) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12 || !preg_match('/[a-z]/', $password) || !preg_match('/[A-Z]/', $password) || !preg_match('/\d/', $password)) {
    fwrite(STDERR, "Données invalides. Le mot de passe doit comporter 12 caractères avec majuscule, minuscule et chiffre.\n");
    exit(1);
}

try {
    $users = new Utilisateur();
    if ($users->findByUsername($username)) {
        fwrite(STDERR, "Ce nom d’utilisateur existe déjà.\n");
        exit(1);
    }
    $users->create(['username' => $username, 'email' => $email, 'nom' => $name, 'password' => $password, 'role' => 'admin', 'actif' => 1]);
    fwrite(STDOUT, "Administrateur créé.\n");
} catch (Throwable $exception) {
    fwrite(STDERR, "Création impossible : {$exception->getMessage()}\n");
    exit(1);
}
