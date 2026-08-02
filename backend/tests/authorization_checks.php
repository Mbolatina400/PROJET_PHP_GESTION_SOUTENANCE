<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/core/PermissionService.php';

function check(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$admin = ['role' => 'admin', 'permissions' => []];
$editor = ['role' => 'utilisateur', 'permissions' => ['etudiants.modifier']];
$reader = ['role' => 'utilisateur', 'permissions' => []];

check(PermissionService::can($admin, 'organismes', 'supprimer'), 'Un administrateur doit tout pouvoir faire.');
check(!PermissionService::can($reader, 'etudiants', 'voir'), 'Un utilisateur sans permission doit être refusé.');
check(PermissionService::can($editor, 'etudiants', 'modifier'), 'Le droit modifier etudiants doit autoriser PUT.');
check(!PermissionService::can($editor, 'etudiants', 'supprimer'), 'Sans droit supprimer etudiants, DELETE doit être refusé.');
check(!PermissionService::isAssignableToStandardUser([['code' => 'utilisateurs.voir']]), 'Les droits utilisateurs sont réservés aux administrateurs.');
check(!PermissionService::isAssignableToStandardUser([['code' => 'etablissement.modifier']]), 'La modification établissement est réservée aux administrateurs.');
check(!PermissionService::isAssignableToStandardUser([['code' => 'journal_activite.voir']]), 'Le journal est réservé aux administrateurs.');
check(PermissionService::isAdminOnly('utilisateurs', 'modifier'), 'La route utilisateurs doit être admin-only.');

echo "Authorization checks passed\n";
