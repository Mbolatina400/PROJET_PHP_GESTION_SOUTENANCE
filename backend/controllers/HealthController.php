<?php

declare(strict_types=1);

class HealthController extends Controller
{
    public function database(): void
    {
        $health = Database::health();
        $this->jsonResponse(
            $health['connected'],
            $health,
            $health['connected'] ? 200 : 503,
            $health['connected'] ? null : $health['reason']
        );
    }
}
