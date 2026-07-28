<?php

declare(strict_types=1);

class EtudiantController extends Controller
{
    private Etudiant $model;
    private array $niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];
    private array $parcours = ['GB', 'SR', 'IG'];

    public function __construct()
    {
        $this->model = new Etudiant();
    }

    public function index(): void
    {
        try {
            $this->jsonResponse(true, $this->model->all());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function show(string $matricule): void
    {
        try {
            $etudiant = $this->model->find($matricule);
            $etudiant ? $this->jsonResponse(true, $etudiant) : $this->jsonResponse(false, null, 404, 'Etudiant introuvable');
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
            if ($this->model->find($data['matricule']) !== null) {
                $this->jsonResponse(false, null, 409, 'Ce matricule existe deja');
                return;
            }

            $this->model->create($data);
            $this->jsonResponse(true, $this->model->find($data['matricule']), 201);
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function update(string $matricule): void
    {
        $data = $this->getBody();
        $error = $this->validatePayload($data, false);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            $updated = $this->model->update($matricule, $data);
            $updated ? $this->jsonResponse(true, $this->model->find($matricule)) : $this->jsonResponse(false, null, 404, 'Etudiant introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(string $matricule): void
    {
        try {
            if ($this->model->aSoutenu($matricule)) {
                $this->jsonResponse(false, null, 409, 'Impossible de supprimer : cet étudiant a déjà une soutenance enregistrée.');
                return;
            }

            $deleted = $this->model->delete($matricule);
            $deleted ? $this->jsonResponse(true, ['message' => 'Etudiant supprimé']) : $this->jsonResponse(false, null, 404, 'Etudiant introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function recherche(): void
    {
        $query = $_GET['q'] ?? '';
        if ($query === '') {
            $this->jsonResponse(false, null, 400, 'Le paramètre q est obligatoire');
            return;
        }

        try {
            $this->jsonResponse(true, $this->model->search($query));
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function parNiveau(): void
    {
        $niveau = $_GET['niveau'] ?? '';
        $error = $this->validateEnum('niveau', $niveau, $this->niveaux);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            $this->jsonResponse(true, $this->model->byNiveau($niveau));
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function effectifs(): void
    {
        try {
            $this->jsonResponse(true, $this->model->effectifs());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function nonSoutenus(): void
    {
        try {
            $this->jsonResponse(true, $this->model->nonSoutenus());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    private function validatePayload(array $data, bool $isCreation): ?string
    {
        $fields = $isCreation
            ? ['matricule', 'nom', 'prenoms', 'niveau', 'parcours']
            : ['nom', 'prenoms', 'niveau', 'parcours'];
        $error = $this->requireFields($data, $fields);
        if ($error !== null) {
            return $error;
        }

        return $this->validateEnum('niveau', $data['niveau'], $this->niveaux)
            ?? $this->validateEnum('parcours', $data['parcours'], $this->parcours);
    }
}
