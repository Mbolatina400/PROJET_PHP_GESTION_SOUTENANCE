<?php

declare(strict_types=1);

class AuthController extends Controller
{
    public function login(): void
    {
        $data = $this->getBody();
        $username = trim((string) ($data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        if ($username === '' || $password === '') {
            $this->jsonResponse(false, null, 400, 'Identifiant et mot de passe obligatoires');
            return;
        }
        $retryAfter = LoginRateLimiter::retryAfter($username);
        if ($retryAfter > 0) {
            $this->jsonResponse(false, null, 429, 'Trop de tentatives. Réessayez dans ' . (int) ceil($retryAfter / 60) . ' minute(s)');
            return;
        }

        try {
            $user = (new Utilisateur())->findByUsername($username);
            if (!$user || !(bool) $user['actif'] || !password_verify($password, $user['password_hash'])) {
                LoginRateLimiter::recordFailure($username);
                $this->jsonResponse(false, null, 401, 'Identifiant ou mot de passe incorrect');
                return;
            }
            LoginRateLimiter::clear($username);
            Auth::login(['id' => $user['id'], 'username' => $user['username'], 'email' => $user['email'], 'nom' => $user['nom'], 'role' => $user['role'], 'actif' => $user['actif']]);
            $this->jsonResponse(true, [...Auth::user(), 'csrf_token' => Auth::csrfToken()]);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function logout(): void
    {
        Auth::logout();
        $this->jsonResponse(true, ['message' => 'Déconnexion effectuée']);
    }

    public function me(): void
    {
        $user = Auth::user();
        $user ? $this->jsonResponse(true, [...$user, 'csrf_token' => Auth::csrfToken()]) : $this->jsonResponse(false, null, 401, 'Session expirée');
    }

    public function changePassword(): void
    {
        $data = $this->getBody();
        $currentPassword = (string) ($data['current_password'] ?? '');
        $newPassword = (string) ($data['new_password'] ?? '');
        if ($currentPassword === '' || !$this->isStrongPassword($newPassword)) {
            $this->jsonResponse(false, null, 400, 'Le nouveau mot de passe doit comporter au moins 12 caractères, une majuscule, une minuscule et un chiffre');
            return;
        }
        try {
            $currentUser = Auth::user();
            $user = $currentUser ? (new Utilisateur())->findByUsername($currentUser['username']) : null;
            if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
                $this->jsonResponse(false, null, 400, 'Mot de passe actuel incorrect');
                return;
            }
            (new Utilisateur())->updatePassword((int) $user['id'], $newPassword);
            $this->jsonResponse(true, ['message' => 'Mot de passe mis à jour']);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    private function isStrongPassword(string $password): bool
    {
        return strlen($password) >= 12 && preg_match('/[a-z]/', $password) && preg_match('/[A-Z]/', $password) && preg_match('/\d/', $password);
    }
}
