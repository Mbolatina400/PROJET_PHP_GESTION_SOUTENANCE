<?php

declare(strict_types=1);

class PermissionService
{
    public const RESTRICTED_CODES = ['etablissement.modifier', 'utilisateurs.voir', 'utilisateurs.ajouter', 'utilisateurs.modifier', 'journal_activite.voir'];

    public static function codesForUser(int $userId): array
    {
        return array_column((new Permission())->forUser($userId), 'code');
    }

    public static function can(array $user, string $resource, string $action): bool
    {
        return ($user['role'] ?? null) === 'admin' || in_array(self::code($resource, $action), $user['permissions'] ?? [], true);
    }

    public static function code(string $resource, string $action): string
    {
        return $resource . '.' . $action;
    }

    public static function isAssignableToStandardUser(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (in_array($permission['code'] ?? '', self::RESTRICTED_CODES, true)) return false;
        }
        return true;
    }

    public static function isAdminOnly(string $resource, string $action): bool
    {
        return in_array(self::code($resource, $action), self::RESTRICTED_CODES, true);
    }
}
