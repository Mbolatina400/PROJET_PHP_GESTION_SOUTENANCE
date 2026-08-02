<?php

declare(strict_types=1);

use Dompdf\Dompdf;
use Dompdf\Options;

class PdfGenerator
{
    public static function procesVerbal(array $data, array $etablissement = []): string
    {
        if (!class_exists(Dompdf::class)) {
            throw new RuntimeException('Dompdf est indisponible. Exécutez composer install dans le dossier backend.');
        }

        $noteEnLettres = self::numberToFrench((int) $data['note']);
        $logoDataUri = self::logoDataUri($etablissement['logo_path'] ?? null);

        ob_start();
        require dirname(__DIR__) . '/views/pdf/proces_verbal_template.php';
        $html = ob_get_clean();

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    private static function numberToFrench(int $number): string
    {
        $numbers = [
            0 => 'zéro',
            1 => 'un',
            2 => 'deux',
            3 => 'trois',
            4 => 'quatre',
            5 => 'cinq',
            6 => 'six',
            7 => 'sept',
            8 => 'huit',
            9 => 'neuf',
            10 => 'dix',
            11 => 'onze',
            12 => 'douze',
            13 => 'treize',
            14 => 'quatorze',
            15 => 'quinze',
            16 => 'seize',
            17 => 'dix-sept',
            18 => 'dix-huit',
            19 => 'dix-neuf',
            20 => 'vingt',
        ];

        return $numbers[$number] ?? (string) $number;
    }

    private static function logoDataUri(?string $filename): ?string
    {
        if (!$filename) {
            return null;
        }
        $file = dirname(__DIR__) . '/public/uploads/' . basename($filename);
        if (!is_file($file)) {
            return null;
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file);
        $content = file_get_contents($file);
        return $mime && $content !== false ? 'data:' . $mime . ';base64,' . base64_encode($content) : null;
    }
}
