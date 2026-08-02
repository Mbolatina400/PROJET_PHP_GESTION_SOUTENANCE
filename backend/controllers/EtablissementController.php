<?php

declare(strict_types=1);

class EtablissementController extends Controller
{
    private const MAX_LOGO_SIZE = 2 * 1024 * 1024;
    private const LOGO_MIME_TYPES = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'];
    private Etablissement $model;

    public function __construct()
    {
        $this->model = new Etablissement();
    }

    public function show(): void
    {
        try {
            $this->jsonResponse(true, $this->model->get());
        } catch (Throwable $exception) {
            if ($this->isMigrationMissing($exception)) {
                $this->jsonResponse(false, null, 503, 'Configuration établissement indisponible : appliquez la migration database/migrations/001_create_etablissement.sql');
                return;
            }
            $this->handleException($exception);
        }
    }

    public function update(): void
    {
        if (!$this->canManageEtablissement()) {
            $this->jsonResponse(false, null, 403, 'Action non autorisée');
            return;
        }
        $data = $this->getBody();
        $clean = [];
        foreach (['nom', 'sigle', 'faculte', 'adresse', 'ville', 'telephone', 'email', 'site_web'] as $field) {
            if (isset($data[$field]) && !is_scalar($data[$field])) {
                $this->jsonResponse(false, null, 400, "Le champ {$field} est invalide");
                return;
            }
            $clean[$field] = trim((string) ($data[$field] ?? '')) ?: null;
        }
        $error = $this->requireFields($clean, ['nom']);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }
        if (!empty($clean['email']) && filter_var($clean['email'], FILTER_VALIDATE_EMAIL) === false) {
            $this->jsonResponse(false, null, 400, 'Adresse email invalide');
            return;
        }
        if (!empty($clean['site_web']) && !$this->isValidWebsite($clean['site_web'])) {
            $this->jsonResponse(false, null, 400, 'Le site web doit être une URL HTTP ou HTTPS valide');
            return;
        }
        if (!empty($clean['telephone']) && !$this->isValidPhone($clean['telephone'])) {
            $this->jsonResponse(false, null, 400, 'Le téléphone doit contenir entre 6 et 25 chiffres et uniquement des séparateurs usuels');
            return;
        }

        try {
            $this->jsonResponse(true, $this->model->save($clean));
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function uploadLogo(): void
    {
        if (!$this->canManageEtablissement()) {
            $this->jsonResponse(false, null, 403, 'Action non autorisée');
            return;
        }
        $file = $_FILES['logo'] ?? null;
        if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $this->jsonResponse(false, null, 400, 'Veuillez sélectionner une image de logo');
            return;
        }
        if (!is_uploaded_file($file['tmp_name'] ?? '') || !is_int($file['size'] ?? null) || $file['size'] < 1) {
            $this->jsonResponse(false, null, 400, 'Le fichier de logo est invalide');
            return;
        }
        if ($file['size'] > self::MAX_LOGO_SIZE) {
            $this->jsonResponse(false, null, 400, 'Le logo ne doit pas dépasser 2 Mo');
            return;
        }

        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        $imageInfo = @getimagesize($file['tmp_name']);
        if (!isset(self::LOGO_MIME_TYPES[$mime]) || !is_array($imageInfo) || ($imageInfo['mime'] ?? null) !== $mime) {
            $this->jsonResponse(false, null, 400, 'Le logo doit être une image PNG, JPEG ou WebP');
            return;
        }

        $uploadDir = dirname(__DIR__) . '/public/uploads';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
            $this->jsonResponse(false, null, 500, 'Impossible de préparer le dossier des logos');
            return;
        }
        $filename = 'etablissement-' . bin2hex(random_bytes(12)) . '.' . self::LOGO_MIME_TYPES[$mime];
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $filename)) {
            $this->jsonResponse(false, null, 500, 'Impossible d’enregistrer le logo');
            return;
        }

        try {
            $result = $this->model->saveLogoPath($filename);
            $this->deleteStoredLogoIfUnused($result['previous_logo_path'] ?? null);
            $this->jsonResponse(true, $result['etablissement']);
        } catch (Throwable $exception) {
            $this->deleteStoredLogoIfUnused($filename);
            $this->handleException($exception);
        }
    }

    public function deleteLogo(): void
    {
        if (!$this->canManageEtablissement()) {
            $this->jsonResponse(false, null, 403, 'Action non autorisée');
            return;
        }
        try {
            $result = $this->model->removeLogo();
            $this->deleteStoredLogoIfUnused($result['previous_logo_path'] ?? null);
            $this->jsonResponse(true, $result['etablissement']);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function logo(): void
    {
        try {
            $path = $this->model->get()['logo_path'] ?? null;
            $file = $path ? dirname(__DIR__) . '/public/uploads/' . basename($path) : '';
            if (!$file || !is_file($file)) {
                http_response_code(404);
                return;
            }
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file) ?: 'application/octet-stream';
            header('Content-Type: ' . $mime);
            header('Cache-Control: private, max-age=300');
            readfile($file);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    private function isValidWebsite(string $website): bool
    {
        $parts = filter_var(trim($website), FILTER_VALIDATE_URL);
        if ($parts === false) {
            return false;
        }
        $scheme = strtolower((string) parse_url($website, PHP_URL_SCHEME));
        $host = parse_url($website, PHP_URL_HOST);
        return in_array($scheme, ['http', 'https'], true) && is_string($host) && $host !== '';
    }

    private function isValidPhone(string $phone): bool
    {
        $phone = trim($phone);
        $digits = preg_replace('/\D/', '', $phone);
        return is_string($digits)
            && strlen($digits) >= 6
            && strlen($digits) <= 25
            && preg_match('/^\+?[0-9 .()\/-]+$/', $phone) === 1;
    }

    private function deleteStoredLogoIfUnused(?string $filename): void
    {
        try {
            if (!$filename || $this->model->isLogoPathInUse($filename)) {
                return;
            }
            $safeFilename = basename($filename);
            if ($safeFilename !== $filename || !str_starts_with($safeFilename, 'etablissement-')) {
                return;
            }
            $file = dirname(__DIR__) . '/public/uploads/' . $safeFilename;
            if (is_file($file) && !unlink($file)) {
                error_log('[API] Impossible de supprimer l’ancien logo : ' . $safeFilename);
            }
        } catch (Throwable $exception) {
            error_log('[API] Vérification du logo à supprimer impossible : ' . $exception->getMessage());
        }
    }

    private function isMigrationMissing(Throwable $exception): bool
    {
        $message = $exception->getMessage();
        return str_contains($message, '42S02') || str_contains(strtolower($message), "table 'etablissement' doesn't exist");
    }

    /**
     * Point d’extension pour un futur contrôle d’accès, sans imposer
     * d’authentification tant qu’aucune règle métier n’est définie.
     */
    protected function canManageEtablissement(): bool
    {
        return true;
    }
}
