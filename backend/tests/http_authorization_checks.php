<?php

declare(strict_types=1);

/**
 * Vérifications HTTP d'intégration, sans migration ni initialisation de données.
 *
 * Exécuter uniquement contre une API connectée à une BASE DE TEST dédiée :
 * TEST_API_BASE_URL=http://127.0.0.1:8001/api \
 * TEST_ADMIN_USERNAME=... TEST_ADMIN_PASSWORD=... \
 * TEST_READER_USERNAME=... TEST_READER_PASSWORD=... \
 * TEST_EDITOR_USERNAME=... TEST_EDITOR_PASSWORD=... \
 * TEST_REPORTS_USERNAME=... TEST_REPORTS_PASSWORD=... \
 * TEST_TARGET_USER_ID=... TEST_TARGET_USERNAME=... TEST_AUDIT_PERMISSION_ID=... \
 * TEST_STUDENT_MATRICULE=... TEST_STUDENT_JSON='{"nom":"...","prenoms":"...","niveau":"L1","parcours":"GB"}' \
 * php tests/http_authorization_checks.php
 *
 * Préparer les comptes ainsi : reader sans droit, editor avec etudiants.modifier
 * seulement, reports avec effectifs.voir + notes.voir + non_soutenus.voir +
 * soutenances.voir uniquement. TEST_TARGET_USER_ID doit être un rôle utilisateur.
 */

function required(string $name): string { $value = getenv($name); if ($value === false || $value === '') throw new RuntimeException("Variable requise: {$name}"); return $value; }
function check(bool $condition, string $message): void { if (!$condition) throw new RuntimeException($message); }

final class HttpClient
{
    private string $base;
    private string $cookieFile;
    private ?string $csrf = null;
    public function __construct(string $base) { $this->base = rtrim($base, '/'); $this->cookieFile = tempnam(sys_get_temp_dir(), 'soutenances-test-'); }
    public function __destruct() { if (is_file($this->cookieFile)) unlink($this->cookieFile); }
    public function request(string $method, string $path, ?array $payload = null): array {
        $curl = curl_init($this->base . $path);
        $headers = ['Accept: application/json'];
        if ($payload !== null) $headers[] = 'Content-Type: application/json';
        if ($this->csrf !== null) $headers[] = 'X-CSRF-Token: ' . $this->csrf;
        curl_setopt_array($curl, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers, CURLOPT_COOKIEJAR => $this->cookieFile, CURLOPT_COOKIEFILE => $this->cookieFile]);
        if ($payload !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($payload, JSON_THROW_ON_ERROR));
        $body = curl_exec($curl); $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE); curl_close($curl);
        return [$status, json_decode((string) $body, true)];
    }
    public function login(string $username, string $password): void { [$status, $body] = $this->request('POST', '/auth/login', ['username' => $username, 'password' => $password]); check($status === 200, "Connexion refusée pour {$username}"); $this->csrf = $body['data']['csrf_token'] ?? null; check(is_string($this->csrf), 'Jeton CSRF absent'); }
}

try {
    if (!function_exists('curl_init')) throw new RuntimeException('L’extension PHP cURL est requise.');
    $base = required('TEST_API_BASE_URL');
    $anonymous = new HttpClient($base); [$status] = $anonymous->request('GET', '/etudiants'); check($status === 401, 'Sans session, /etudiants doit répondre 401.');

    $reader = new HttpClient($base); $reader->login(required('TEST_READER_USERNAME'), required('TEST_READER_PASSWORD')); [$status] = $reader->request('GET', '/etudiants'); check($status === 403, 'Un utilisateur sans droit doit recevoir 403.');
    $admin = new HttpClient($base); $admin->login(required('TEST_ADMIN_USERNAME'), required('TEST_ADMIN_PASSWORD')); [$status] = $admin->request('GET', '/etudiants'); check($status === 200, 'L’administrateur doit accéder à /etudiants.');
    $editor = new HttpClient($base); $editor->login(required('TEST_EDITOR_USERNAME'), required('TEST_EDITOR_PASSWORD')); $student = json_decode(required('TEST_STUDENT_JSON'), true, 512, JSON_THROW_ON_ERROR); [$status] = $editor->request('PUT', '/etudiants/' . rawurlencode(required('TEST_STUDENT_MATRICULE')), $student); check($status === 200, 'etudiants.modifier doit autoriser PUT.'); [$status] = $editor->request('DELETE', '/etudiants/' . rawurlencode(required('TEST_STUDENT_MATRICULE'))); check($status === 403, 'Sans etudiants.supprimer, DELETE doit répondre 403.');

    $reports = new HttpClient($base); $reports->login(required('TEST_REPORTS_USERNAME'), required('TEST_REPORTS_PASSWORD')); foreach (['/rapports/effectifs', '/soutenances/notes?debut=2020-2021&fin=2030-2031', '/etudiants/non-soutenus', '/soutenances'] as $path) { [$status] = $reports->request('GET', $path); check($status === 200, "Le droit de rapport dédié doit suffire pour {$path}."); }

    [$status, $catalogue] = $admin->request('GET', '/permissions'); check($status === 200, 'Catalogue des permissions inaccessible.'); $restricted = array_values(array_filter($catalogue['data'], fn (array $permission): bool => $permission['code'] === 'utilisateurs.voir')); check($restricted !== [], 'Permission utilisateurs.voir absente.'); [$status, $targetPermissions] = $admin->request('GET', '/utilisateurs/' . required('TEST_TARGET_USER_ID') . '/permissions'); check($status === 200, 'Permissions cible indisponibles.'); $originalIds = array_map(fn (array $permission): int => (int) $permission['id'], $targetPermissions['data']); [$status] = $admin->request('PUT', '/utilisateurs/' . required('TEST_TARGET_USER_ID') . '/permissions', ['permission_ids' => [...$originalIds, (int) $restricted[0]['id']]]); check($status === 403, 'Une permission réservée ne doit pas être attribuable à un utilisateur standard.');

    $auditPermissionId = (int) required('TEST_AUDIT_PERMISSION_ID'); $changedIds = in_array($auditPermissionId, $originalIds, true) ? array_values(array_diff($originalIds, [$auditPermissionId])) : [...$originalIds, $auditPermissionId]; [$status] = $admin->request('PUT', '/utilisateurs/' . required('TEST_TARGET_USER_ID') . '/permissions', ['permission_ids' => $changedIds]); check($status === 200, 'Changement de permission de test impossible.'); try { [$status, $audit] = $admin->request('GET', '/audit'); check($status === 200 && (bool) array_filter($audit['data'], fn (array $entry): bool => str_contains((string) ($entry['details'] ?? ''), required('TEST_TARGET_USERNAME'))), 'Le changement de permissions n’est pas audité avec la cible.'); } finally { $admin->request('PUT', '/utilisateurs/' . required('TEST_TARGET_USER_ID') . '/permissions', ['permission_ids' => $originalIds]); }
    echo "HTTP authorization checks passed\n";
} catch (Throwable $exception) { fwrite(STDERR, "HTTP authorization checks failed: {$exception->getMessage()}\n"); exit(1); }
