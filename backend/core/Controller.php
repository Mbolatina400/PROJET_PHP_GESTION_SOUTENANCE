<?php

declare(strict_types=1);

abstract class Controller
{
    protected function jsonResponse(bool $success, mixed $data = null, int $statusCode = 200, ?string $error = null): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $payload = $success
            ? ['success' => true, 'data' => $data]
            : ['success' => false, 'error' => $error ?? 'Erreur'];

        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    protected function getBody(): array
    {
        $rawBody = file_get_contents('php://input');
        if ($rawBody === false || trim($rawBody) === '') {
            return [];
        }

        $body = json_decode($rawBody, true);
        return is_array($body) ? $body : [];
    }

    protected function requireFields(array $data, array $fields): ?string
    {
        foreach ($fields as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
                return "Le champ {$field} est obligatoire";
            }
        }

        return null;
    }

    protected function validateEnum(string $field, mixed $value, array $allowedValues): ?string
    {
        if (!in_array($value, $allowedValues, true)) {
            return "Valeur invalide pour {$field}";
        }

        return null;
    }

    protected function handleException(Throwable $exception): void
    {
        $message = $exception->getMessage();
        $databaseUnavailable = Database::isConnectionException($exception);
        $status = match (true) {
            str_contains($message, '23000') => 409,
            $databaseUnavailable => 503,
            default => 500,
        };

        error_log(sprintf(
            '[API] %s: %s',
            $exception::class,
            $message
        ));

        $error = match (true) {
            $status === 409 => 'Conflit de données ou contrainte SQL violée',
            $databaseUnavailable => Database::connectionErrorMessage($exception),
            default => 'Erreur interne du serveur',
        };
        $this->jsonResponse(false, null, $status, $error);
    }
}
