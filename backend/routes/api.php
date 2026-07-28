<?php

declare(strict_types=1);

/** @var Router $router */

$router->get('/api/health/database', [HealthController::class, 'database']);

$router->get('/api/etudiants/recherche', [EtudiantController::class, 'recherche']);
$router->get('/api/etudiants/par-niveau', [EtudiantController::class, 'parNiveau']);
$router->get('/api/etudiants/effectifs', [EtudiantController::class, 'effectifs']);
$router->get('/api/etudiants/non-soutenus', [EtudiantController::class, 'nonSoutenus']);
$router->get('/api/etudiants', [EtudiantController::class, 'index']);
$router->get('/api/etudiants/{matricule}', [EtudiantController::class, 'show']);
$router->post('/api/etudiants', [EtudiantController::class, 'store']);
$router->put('/api/etudiants/{matricule}', [EtudiantController::class, 'update']);
$router->delete('/api/etudiants/{matricule}', [EtudiantController::class, 'destroy']);

$router->get('/api/professeurs', [ProfesseurController::class, 'index']);
$router->get('/api/professeurs/{idprof}', [ProfesseurController::class, 'show']);
$router->post('/api/professeurs', [ProfesseurController::class, 'store']);
$router->put('/api/professeurs/{idprof}', [ProfesseurController::class, 'update']);
$router->delete('/api/professeurs/{idprof}', [ProfesseurController::class, 'destroy']);

$router->get('/api/organismes', [OrganismeController::class, 'index']);
$router->get('/api/organismes/{idorg}', [OrganismeController::class, 'show']);
$router->post('/api/organismes', [OrganismeController::class, 'store']);
$router->put('/api/organismes/{idorg}', [OrganismeController::class, 'update']);
$router->delete('/api/organismes/{idorg}', [OrganismeController::class, 'destroy']);

$router->get('/api/soutenances/notes', [SoutenirController::class, 'notes']);
$router->get('/api/soutenances/{id}/pv', [SoutenirController::class, 'procesVerbal']);
$router->get('/api/soutenances', [SoutenirController::class, 'index']);
$router->get('/api/soutenances/{id}', [SoutenirController::class, 'show']);
$router->post('/api/soutenances', [SoutenirController::class, 'store']);
$router->put('/api/soutenances/{id}', [SoutenirController::class, 'update']);
$router->delete('/api/soutenances/{id}', [SoutenirController::class, 'destroy']);
