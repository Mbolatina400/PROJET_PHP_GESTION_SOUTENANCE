<?php

declare(strict_types=1);

class SoutenirController extends Controller
{
    private Soutenir $model;

    public function __construct()
    {
        $this->model = new Soutenir();
    }

    public function index(): void
    {
        try {
            $this->jsonResponse(true, $this->model->all());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function show(string $id): void
    {
        try {
            $soutenance = $this->model->find((int) $id);
            $soutenance ? $this->jsonResponse(true, $soutenance) : $this->jsonResponse(false, null, 404, 'Soutenance introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function store(): void
    {
        $data = $this->normalizeSoutenancePayload($this->getBody());
        $error = $this->validatePayload($data);
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

    public function update(string $id): void
    {
        $data = $this->normalizeSoutenancePayload($this->getBody());
        $error = $this->validatePayload($data);
        if ($error !== null) {
            $this->jsonResponse(false, null, 400, $error);
            return;
        }

        try {
            $updated = $this->model->update((int) $id, $data);
            $updated ? $this->jsonResponse(true, $this->model->find((int) $id)) : $this->jsonResponse(false, null, 404, 'Soutenance introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $deleted = $this->model->delete((int) $id);
            $deleted ? $this->jsonResponse(true, ['message' => 'Soutenance supprimée']) : $this->jsonResponse(false, null, 404, 'Soutenance introuvable');
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function notes(): void
    {
        $debut = $_GET['debut'] ?? '';
        $fin = $_GET['fin'] ?? '';

        if (!$this->isValidAnneeUniv($debut) || !$this->isValidAnneeUniv($fin)) {
            $this->jsonResponse(false, null, 400, 'Les paramètres debut et fin doivent respecter le format 2022-2023');
            return;
        }

        try {
            $this->jsonResponse(true, $this->model->notesBetween($debut, $fin));
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    public function procesVerbal(string $id): void
    {
        try {
            $data = $this->model->procesVerbalData((int) $id);
            if ($data === null) {
                $this->jsonResponse(false, null, 404, 'Soutenance introuvable');
                return;
            }

            $pdf = PdfGenerator::procesVerbal($data);
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="proces-verbal-' . (int) $id . '.pdf"');
            header('Content-Length: ' . strlen($pdf));
            http_response_code(200);
            echo $pdf;
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }

    private function normalizeSoutenancePayload(array $data): array
    {
        if (array_key_exists('rapporteur_ext', $data) && $data['rapporteur_ext'] === '') {
            $data['rapporteur_ext'] = null;
        }

        return $data;
    }

    private function validatePayload(array $data): ?string
    {
        $error = $this->requireFields($data, [
            'matricule',
            'idorg',
            'annee_univ',
            'note',
            'president',
            'examinateur',
            'rapporteur_int',
        ]);

        if (array_key_exists('rapporteur_ext', $data) && $data['rapporteur_ext'] === '') {
            $data['rapporteur_ext'] = null;
        }

        if ($error !== null) {
            return $error;
        }

        if (!$this->isValidAnneeUniv((string) $data['annee_univ'])) {
            return 'annee_univ doit respecter le format 2022-2023';
        }

        $note = filter_var($data['note'], FILTER_VALIDATE_INT);
        if ($note === false || $note < 0 || $note > 20) {
            return 'note doit être un entier entre 0 et 20';
        }

        return null;
    }

    private function isValidAnneeUniv(string $value): bool
    {
        return preg_match('/^[0-9]{4}-[0-9]{4}$/', $value) === 1;
    }
}
