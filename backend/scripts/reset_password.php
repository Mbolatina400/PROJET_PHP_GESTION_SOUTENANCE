<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/models/Utilisateur.php';

function passwordIsStrong(string $password): bool
{
    return strlen($password) >= 12
        && preg_match('/[a-z]/', $password) === 1
        && preg_match('/[A-Z]/', $password) === 1
        && preg_match('/\d/', $password) === 1;
}

function promptHidden(string $prompt): string
{
    fwrite(STDOUT, $prompt);
    if (function_exists('posix_isatty') && posix_isatty(STDIN)) {
        $savedMode = shell_exec('stty -g');
        if (is_string($savedMode) && trim($savedMode) !== '') {
            system('stty -echo');
            $value = fgets(STDIN);
            system('stty ' . trim($savedMode));
            fwrite(STDOUT, PHP_EOL);
            return trim((string) $value);
        }
    }

    fwrite(STDERR, "Mot de passe non fourni : utilisez RESET_PASSWORD dans un environnement protégé hors terminal interactif.\n");
    exit(1);
}

$username = trim((string) ($argv[1] ?? getenv('RESET_USERNAME')));
$password = (string) getenv('RESET_PASSWORD');

if ($username === '') {
    fwrite(STDERR, "Usage: RESET_USERNAME=... RESET_PASSWORD=... php scripts/reset_password.php\n");
    fwrite(STDERR, "   ou: php scripts/reset_password.php <username>  (saisie masquée du mot de passe)\n");
    exit(1);
}
if ($password === '') $password = promptHidden('Nouveau mot de passe : ');
if (!passwordIsStrong($password)) {
    fwrite(STDERR, "Mot de passe invalide : 12 caractères minimum, avec majuscule, minuscule et chiffre.\n");
    exit(1);
}

try {
    $users = new Utilisateur();
    $user = $users->findByUsername($username);
    if ($user === null) {
        fwrite(STDERR, "Utilisateur introuvable.\n");
        exit(1);
    }
    $users->updatePassword((int) $user['id'], $password);
    fwrite(STDOUT, "Mot de passe réinitialisé pour l’utilisateur demandé.\n");
} catch (Throwable $exception) {
    fwrite(STDERR, "Réinitialisation impossible : {$exception->getMessage()}\n");
    exit(1);
}
