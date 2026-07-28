<?php

declare(strict_types=1);

$escape = static fn (?string $value): string => htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
$juryRows = [
    ['Président', $data['president_civilite'], $data['president_nom'], $data['president_grade']],
    ['Examinateur', $data['examinateur_civilite'], $data['examinateur_nom'], $data['examinateur_grade']],
    ['Rapporteur interne', $data['rapporteur_int_civilite'], $data['rapporteur_int_nom'], $data['rapporteur_int_grade']],
    ['Rapporteur externe', $data['rapporteur_ext_civilite'], $data['rapporteur_ext_nom'], $data['rapporteur_ext_grade']],
];
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; line-height: 1.55; }
        h1 { text-align: center; font-size: 24px; letter-spacing: 1px; margin: 24px 0 32px; }
        .meta { margin-bottom: 24px; }
        .section-title { font-weight: bold; margin-top: 24px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .signature { margin-top: 48px; text-align: right; }
    </style>
</head>
<body>
    <h1>PROCES VERBAL</h1>

    <div class="meta">
        <div><strong>Année universitaire :</strong> <?= $escape($data['annee_univ']) ?></div>
        <div><strong>Mention / Parcours :</strong> Informatique / <?= $escape($data['parcours']) ?></div>
        <div><strong>Niveau :</strong> <?= $escape($data['niveau']) ?></div>
        <div><strong>Organisme d'accueil :</strong> <?= $escape($data['organisme_design']) ?>, <?= $escape($data['organisme_lieu']) ?></div>
    </div>

    <p>
        L'étudiant(e) <strong><?= $escape($data['etudiant_nom']) ?> <?= $escape($data['etudiant_prenoms']) ?></strong>,
        matricule <strong><?= $escape($data['matricule']) ?></strong>, a soutenu publiquement son mémoire de fin d'études
        devant les membres du jury ci-dessous.
    </p>

    <p>
        La note attribuée est de <strong><?= (int) $data['note'] ?>/20</strong>
        (<strong><?= $escape($noteEnLettres) ?></strong>).
    </p>

    <div class="section-title">Membres du jury</div>
    <table>
        <thead>
            <tr>
                <th>Rôle</th>
                <th>Civilité et nom</th>
                <th>Grade</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($juryRows as [$role, $civilite, $nom, $grade]): ?>
                <tr>
                    <td><?= $escape($role) ?></td>
                    <td><?= $civilite ? $escape($civilite . ' ' . $nom) : 'Non renseigné' ?></td>
                    <td><?= $grade ? $escape($grade) : 'Non renseigné' ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="signature">
        Fait pour servir et valoir ce que de droit.
    </div>
</body>
</html>
