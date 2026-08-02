<?php

declare(strict_types=1);

class PermissionController extends Controller
{
    private Permission $permissions;
    private Utilisateur $users;

    public function __construct()
    {
        $this->permissions = new Permission();
        $this->users = new Utilisateur();
    }

    public function index(): void
    {
        try { $this->jsonResponse(true, $this->permissions->all()); } catch (Throwable $exception) { $this->handleException($exception); }
    }

    public function showForUser(string $id): void
    {
        $user = $this->users->findById((int) $id);
        if ($user === null) { $this->jsonResponse(false, null, 404, 'Utilisateur introuvable'); return; }
        try { $this->jsonResponse(true, $this->permissions->forUser((int) $id)); } catch (Throwable $exception) { $this->handleException($exception); }
    }

    public function replaceForUser(string $id): void
    {
        $user = $this->users->findById((int) $id);
        if ($user === null) { $this->jsonResponse(false, null, 404, 'Utilisateur introuvable'); return; }
        $payload = $this->getBody();
        if (!array_key_exists('permission_ids', $payload) || !is_array($payload['permission_ids'])) { $this->jsonResponse(false, null, 400, 'permission_ids doit être un tableau'); return; }
        foreach ($payload['permission_ids'] as $permissionId) {
            if (!is_int($permissionId) && !(is_string($permissionId) && ctype_digit($permissionId))) { $this->jsonResponse(false, null, 400, 'Chaque identifiant de permission doit être un entier'); return; }
        }
        $ids = array_values(array_unique(array_map('intval', $payload['permission_ids'])));
        try {
            $all = $this->permissions->all();
            $byId = array_column($all, null, 'id');
            foreach ($ids as $permissionId) if (!isset($byId[$permissionId])) { $this->jsonResponse(false, null, 400, 'Une permission demandée n’existe pas'); return; }
            $selected = array_map(fn (int $permissionId): array => $byId[$permissionId], $ids);
            if ($user['role'] !== 'admin' && !PermissionService::isAssignableToStandardUser($selected)) { $this->jsonResponse(false, null, 403, 'Ces permissions sont réservées aux administrateurs'); return; }
            $before = $this->permissions->forUser((int) $id);
            $this->permissions->replaceForUser((int) $id, $ids);
            $after = $this->permissions->forUser((int) $id);
            $beforeById = array_column($before, null, 'id');
            $afterById = array_column($after, null, 'id');
            $added = array_values(array_diff_key($afterById, $beforeById));
            $removed = array_values(array_diff_key($beforeById, $afterById));
            $admin = Auth::user();
            if ($admin !== null) AuditLog::recordPermissionChange($admin, $user, $added, $removed);
            $this->jsonResponse(true, $after);
        } catch (Throwable $exception) { $this->handleException($exception); }
    }
}
