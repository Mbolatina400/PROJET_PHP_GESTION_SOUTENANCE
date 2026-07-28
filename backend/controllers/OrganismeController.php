<?php

declare(strict_types=1);

class OrganismeController extends Controller
{
    private Organisme $model;

    public function __construct()
    {
        $this->model = new Organisme();
    }

    public function index(): void
    {
        try {
            $this->jsonResponse(true, $this->model->all());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function show(string $idorg): void
    {
        try {
            $organisme = $this->model->find((int) $idorg);
            $organisme ? $this->jsonResponse(true, $organisme) : $this->jsonResponse(false, null, 404, 'Organisme introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function store(): void
    {
        $data = $this->getBody();
        $error = $this->requireFields($data, ['design', 'lieu']);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            $id = $this->model->create($data);
            $this->jsonResponse(true, $this->model->find($id), 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(string $idorg): void
    {
        $data = $this->getBody();
        $error = $this->requireFields($data, ['design', 'lieu']);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            $updated = $this->model->update((int) $idorg, $data);
            $updated ? $this->jsonResponse(true, $this->model->find((int) $idorg)) : $this->jsonResponse(false, null, 404, 'Organisme introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(string $idorg): void
    {
        try {
            if ($this->model->aDejaAccueilliSoutenance((int) $idorg)) {
                $this->jsonResponse(false, null, 409, 'Impossible de supprimer : cet organisme a déjà accueilli une soutenance.');
                return;
            }

            $deleted = $this->model->delete((int) $idorg);
            $deleted ? $this->jsonResponse(true, ['message' => 'Organisme supprimé']) : $this->jsonResponse(false, null, 404, 'Organisme introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }
}
