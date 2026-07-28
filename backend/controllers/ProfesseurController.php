<?php

declare(strict_types=1);

class ProfesseurController extends Controller
{
    private Professeur $model;
    private array $civilites = ['Mr', 'Mlle', 'Mme'];

    public function __construct()
    {
        $this->model = new Professeur();
    }

    public function index(): void
    {
        try {
            $this->jsonResponse(true, $this->model->all());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function show(string $idprof): void
    {
        try {
            $professeur = $this->model->find($idprof);
            $professeur ? $this->jsonResponse(true, $professeur) : $this->jsonResponse(false, null, 404, 'Professeur introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function store(): void
    {
        $data = $this->getBody();
        $error = $this->validatePayload($data, true);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            if ($this->model->find($data['idprof']) !== null) {
                $this->jsonResponse(false, null, 409, 'Cet ID professeur existe deja');
                return;
            }

            $this->model->create($data);
            $this->jsonResponse(true, $this->model->find($data['idprof']), 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(string $idprof): void
    {
        $data = $this->getBody();
        $error = $this->validatePayload($data, false);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            $updated = $this->model->update($idprof, $data);
            $updated ? $this->jsonResponse(true, $this->model->find($idprof)) : $this->jsonResponse(false, null, 404, 'Professeur introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(string $idprof): void
    {
        try {
            if ($this->model->estMembreJury($idprof)) {
                $this->jsonResponse(false, null, 409, 'Impossible de supprimer : ce professeur est membre du jury d’une soutenance enregistrée.');
                return;
            }

            $deleted = $this->model->delete($idprof);
            $deleted ? $this->jsonResponse(true, ['message' => 'Professeur supprimé']) : $this->jsonResponse(false, null, 404, 'Professeur introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    private function validatePayload(array $data, bool $isCreation): ?string
    {
        $fields = $isCreation
            ? ['idprof', 'nom', 'prenoms', 'civilite', 'grade']
            : ['nom', 'prenoms', 'civilite', 'grade'];
        $error = $this->requireFields($data, $fields);
        if ($error !== null) {
            return $error;
        }

        return $this->validateEnum('civilite', $data['civilite'], $this->civilites);
    }
}
