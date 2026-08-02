<?php

declare(strict_types=1);

class UtilisateurController extends Controller
{
    private Utilisateur $model;

    public function __construct() { $this->model = new Utilisateur(); }

    public function index(): void
    {
        try { $this->jsonResponse(true, $this->model->all()); } catch (Throwable $exception) { $this->handleException($exception); }
    }

    public function store(): void
    {
        $data = $this->validated($this->getBody(), true);
        if (is_string($data)) { $this->jsonResponse(false, null, 400, $data); return; }
        try {
            if ($this->model->findByUsername($data['username'])) { $this->jsonResponse(false, null, 409, 'Ce nom d’utilisateur existe déjà'); return; }
            $this->jsonResponse(true, $this->model->create($data), 201);
        } catch (Throwable $exception) { $this->handleException($exception); }
    }

    public function update(string $id): void
    {
        $data = $this->validated($this->getBody(), false);
        if (is_string($data)) { $this->jsonResponse(false, null, 400, $data); return; }
        try {
            $existing = $this->model->findById((int) $id);
            if (!$existing) { $this->jsonResponse(false, null, 404, 'Utilisateur introuvable'); return; }
            $removesLastAdmin = $existing['role'] === 'admin' && (int) $existing['actif'] === 1 && ($data['role'] !== 'admin' || $data['actif'] !== 1);
            if ($removesLastAdmin && $this->model->countActiveAdmins() <= 1) { $this->jsonResponse(false, null, 409, 'Impossible de désactiver ou rétrograder le dernier administrateur actif'); return; }
            $updated = $this->model->update((int) $id, $data);
            $this->jsonResponse(true, $updated);
        } catch (Throwable $exception) { $this->handleException($exception); }
    }

    private function validated(array $data, bool $creation): array|string
    {
        foreach (['username', 'email', 'nom', 'role', 'password'] as $field) if (isset($data[$field]) && !is_scalar($data[$field])) return "Le champ {$field} est invalide";
        $clean = ['username' => trim((string) ($data['username'] ?? '')), 'email' => trim((string) ($data['email'] ?? '')), 'nom' => trim((string) ($data['nom'] ?? '')), 'role' => $data['role'] ?? '', 'password' => (string) ($data['password'] ?? ''), 'actif' => !empty($data['actif']) ? 1 : 0];
        if ($clean['username'] === '' || !preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $clean['username'])) return 'Le nom d’utilisateur doit contenir 3 à 50 caractères (lettres, chiffres, . _ ou -)';
        if (!filter_var($clean['email'], FILTER_VALIDATE_EMAIL)) return 'Adresse email invalide';
        if ($clean['nom'] === '' || mb_strlen($clean['nom']) > 150) return 'Nom invalide';
        if (!in_array($clean['role'], ['admin', 'utilisateur'], true)) return 'Rôle invalide';
        if (($creation || $clean['password'] !== '') && (strlen($clean['password']) < 12 || !preg_match('/[a-z]/', $clean['password']) || !preg_match('/[A-Z]/', $clean['password']) || !preg_match('/\d/', $clean['password']))) return 'Le mot de passe doit comporter au moins 12 caractères, une majuscule, une minuscule et un chiffre';
        return $clean;
    }
}
