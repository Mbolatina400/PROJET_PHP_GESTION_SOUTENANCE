<?php

declare(strict_types=1);

class AuditController extends Controller
{
    public function index(): void
    {
        try {
            $this->jsonResponse(true, AuditLog::recent());
        } catch (Throwable $exception) {
            $this->handleException($exception);
        }
    }
}
