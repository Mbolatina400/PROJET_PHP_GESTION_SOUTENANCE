<?php

declare(strict_types=1);

/** @var Router $router */

$router->get('/api/health/database', [HealthController::class, 'database']);

$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);
$router->put('/api/auth/password', [AuthController::class, 'changePassword']);

$router->get('/api/utilisateurs', [UtilisateurController::class, 'index'], ['resource' => 'utilisateurs', 'action' => 'voir']);
$router->post('/api/utilisateurs', [UtilisateurController::class, 'store'], ['resource' => 'utilisateurs', 'action' => 'ajouter']);
$router->put('/api/utilisateurs/{id}', [UtilisateurController::class, 'update'], ['resource' => 'utilisateurs', 'action' => 'modifier']);
$router->get('/api/utilisateurs/{id}/permissions', [PermissionController::class, 'showForUser'], ['resource' => 'utilisateurs', 'action' => 'voir']);
$router->put('/api/utilisateurs/{id}/permissions', [PermissionController::class, 'replaceForUser'], ['resource' => 'utilisateurs', 'action' => 'modifier']);
$router->get('/api/permissions', [PermissionController::class, 'index'], ['resource' => 'utilisateurs', 'action' => 'voir']);
$router->get('/api/audit', [AuditController::class, 'index'], ['resource' => 'journal_activite', 'action' => 'voir']);

$router->get('/api/etablissement', [EtablissementController::class, 'show'], ['resource' => 'etablissement', 'action' => 'voir']);
$router->put('/api/etablissement', [EtablissementController::class, 'update'], ['resource' => 'etablissement', 'action' => 'modifier']);
$router->post('/api/etablissement/logo', [EtablissementController::class, 'uploadLogo'], ['resource' => 'etablissement', 'action' => 'modifier']);
$router->delete('/api/etablissement/logo', [EtablissementController::class, 'deleteLogo'], ['resource' => 'etablissement', 'action' => 'modifier']);
$router->get('/api/etablissement/logo', [EtablissementController::class, 'logo'], ['resource' => 'etablissement', 'action' => 'voir']);

$router->get('/api/etudiants/recherche', [EtudiantController::class, 'recherche'], ['resource' => 'etudiants', 'action' => 'voir']);
$router->get('/api/rapports/effectifs', [EtudiantController::class, 'rapportEffectifs'], ['resource' => 'effectifs', 'action' => 'voir']);
$router->get('/api/etudiants/par-niveau', [EtudiantController::class, 'parNiveau'], ['resource' => 'effectifs', 'action' => 'voir']);
$router->get('/api/etudiants/effectifs', [EtudiantController::class, 'effectifs'], ['resource' => 'effectifs', 'action' => 'voir']);
$router->get('/api/etudiants/non-soutenus', [EtudiantController::class, 'nonSoutenus'], ['resource' => 'non_soutenus', 'action' => 'voir']);
$router->get('/api/etudiants', [EtudiantController::class, 'index'], ['resource' => 'etudiants', 'action' => 'voir']);
$router->get('/api/etudiants/{matricule}', [EtudiantController::class, 'show'], ['resource' => 'etudiants', 'action' => 'voir']);
$router->post('/api/etudiants', [EtudiantController::class, 'store'], ['resource' => 'etudiants', 'action' => 'ajouter']);
$router->put('/api/etudiants/{matricule}', [EtudiantController::class, 'update'], ['resource' => 'etudiants', 'action' => 'modifier']);
$router->delete('/api/etudiants/{matricule}', [EtudiantController::class, 'destroy'], ['resource' => 'etudiants', 'action' => 'supprimer']);

$router->get('/api/professeurs', [ProfesseurController::class, 'index'], ['resource' => 'professeurs', 'action' => 'voir']);
$router->get('/api/professeurs/{idprof}', [ProfesseurController::class, 'show'], ['resource' => 'professeurs', 'action' => 'voir']);
$router->post('/api/professeurs', [ProfesseurController::class, 'store'], ['resource' => 'professeurs', 'action' => 'ajouter']);
$router->put('/api/professeurs/{idprof}', [ProfesseurController::class, 'update'], ['resource' => 'professeurs', 'action' => 'modifier']);
$router->delete('/api/professeurs/{idprof}', [ProfesseurController::class, 'destroy'], ['resource' => 'professeurs', 'action' => 'supprimer']);

$router->get('/api/organismes', [OrganismeController::class, 'index'], ['resource' => 'organismes', 'action' => 'voir']);
$router->get('/api/organismes/{idorg}', [OrganismeController::class, 'show'], ['resource' => 'organismes', 'action' => 'voir']);
$router->post('/api/organismes', [OrganismeController::class, 'store'], ['resource' => 'organismes', 'action' => 'ajouter']);
$router->put('/api/organismes/{idorg}', [OrganismeController::class, 'update'], ['resource' => 'organismes', 'action' => 'modifier']);
$router->delete('/api/organismes/{idorg}', [OrganismeController::class, 'destroy'], ['resource' => 'organismes', 'action' => 'supprimer']);

$router->get('/api/soutenances/notes', [SoutenirController::class, 'notes'], ['resource' => 'notes', 'action' => 'voir']);
$router->get('/api/soutenances/form-data', [SoutenirController::class, 'formData'], ['any' => [
    ['resource' => 'soutenances', 'action' => 'ajouter'],
    ['resource' => 'soutenances', 'action' => 'modifier'],
]]);
$router->get('/api/soutenances/{id}/pv', [SoutenirController::class, 'procesVerbal'], ['resource' => 'pdf', 'action' => 'voir']);
$router->get('/api/soutenances', [SoutenirController::class, 'index'], ['resource' => 'soutenances', 'action' => 'voir']);
$router->get('/api/soutenances/{id}', [SoutenirController::class, 'show'], ['resource' => 'soutenances', 'action' => 'voir']);
$router->post('/api/soutenances', [SoutenirController::class, 'store'], ['resource' => 'soutenances', 'action' => 'ajouter']);
$router->put('/api/soutenances/{id}', [SoutenirController::class, 'update'], ['resource' => 'soutenances', 'action' => 'modifier']);
$router->delete('/api/soutenances/{id}', [SoutenirController::class, 'destroy'], ['resource' => 'soutenances', 'action' => 'supprimer']);
