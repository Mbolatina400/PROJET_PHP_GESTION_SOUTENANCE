<?php

declare(strict_types=1);

$escape = static fn (?string $value): string => htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
$juryRows = [
    ['Président', $data['president_civilite'], $data['president_nom'], $data['president_grade']],
    ['Examinateur', $data['examinateur_civilite'], $data['examinateur_nom'], $data['examinateur_grade']],
    ['Rapporteur interne', $data['rapporteur_int_civilite'], $data['rapporteur_int_nom'], $data['rapporteur_int_grade']],
    ['Rapporteur externe', $data['rapporteur_ext_civilite'], $data['rapporteur_ext_nom'], $data['rapporteur_ext_grade']],
];
$note = (float) $data['note'];
$noteAffichee = rtrim(rtrim(number_format($note, 2, ',', ' '), '0'), ',');
$dateGeneration = date('d/m/Y');
$etablissement = $etablissement ?? [];
$nomEtablissement = $etablissement['nom'] ?? 'Gestion des soutenances';
$sousTitreEtablissement = $etablissement['faculte'] ?? '';
$coordonneesEtablissement = array_filter([
    trim(implode(', ', array_filter([$etablissement['adresse'] ?? '', $etablissement['ville'] ?? '']))),
    $etablissement['telephone'] ?? '',
    $etablissement['email'] ?? '',
    $etablissement['site_web'] ?? '',
]);
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 22mm 16mm 20mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #26364f; line-height: 1.55; }
        .document-header { width: 100%; border-bottom: 2px solid #245fb7; padding-bottom: 13px; }
        .brand-mark { display: inline-block; width: 40px; height: 40px; color: #fff; background: #245fb7; border-radius: 8px; font-size: 16px; font-weight: bold; line-height: 40px; text-align: center; }
        .brand-logo { width: 40px; height: 40px; object-fit: contain; }
        .brand-copy { padding-left: 10px; vertical-align: middle; }
        .brand-copy strong { display: block; color: #162b4d; font-size: 14px; letter-spacing: .3px; text-transform: uppercase; }
        .brand-copy span { color: #6c7b91; font-size: 8px; letter-spacing: .8px; text-transform: uppercase; }
        .brand-contact { margin-top: 3px; color: #52647d; font-size: 7px; line-height: 1.35; }
        .document-reference { color: #6c7b91; font-size: 8px; text-align: right; vertical-align: middle; }
        .document-reference strong { display: block; color: #245fb7; font-size: 10px; }
        .title-block { margin: 25px 0 21px; text-align: center; }
        .eyebrow { margin: 0 0 5px; color: #245fb7; font-size: 8px; font-weight: bold; letter-spacing: 1.2px; text-transform: uppercase; }
        h1 { margin: 0; color: #162b4d; font-size: 21px; letter-spacing: .5px; text-transform: uppercase; }
        .title-rule { width: 56px; height: 3px; margin: 10px auto 0; background: #efb24d; }
        .summary { width: 100%; margin-bottom: 19px; border: 1px solid #d8e3f0; border-radius: 7px; background: #f7faff; }
        .summary td { width: 50%; padding: 8px 10px; border-bottom: 1px solid #e2ebf5; }
        .summary tr:last-child td { border-bottom: 0; }
        .summary td:first-child { border-right: 1px solid #e2ebf5; }
        .summary-label { display: block; margin-bottom: 1px; color: #70819a; font-size: 7px; font-weight: bold; letter-spacing: .7px; text-transform: uppercase; }
        .summary-value { color: #243957; font-size: 10px; font-weight: bold; }
        .intro { margin: 0 0 16px; padding: 0 4px; text-align: justify; }
        .note-box { width: 100%; margin: 4px 0 22px; background: #162b4d; border-radius: 8px; color: #fff; }
        .note-box td { padding: 12px 15px; }
        .note-label { color: #bcd4fa; font-size: 8px; letter-spacing: .8px; text-transform: uppercase; }
        .note-value { color: #fff; font-size: 22px; font-weight: bold; text-align: right; }
        .note-words { color: #e5efff; font-size: 9px; text-align: right; }
        .section-title { margin: 0 0 8px; color: #162b4d; font-size: 11px; font-weight: bold; }
        .section-title span { display: inline-block; width: 4px; height: 12px; margin-right: 6px; background: #efb24d; vertical-align: -2px; }
        .jury-table { width: 100%; border-collapse: collapse; }
        .jury-table th { padding: 8px 9px; color: #fff; background: #1d467e; font-size: 8px; letter-spacing: .5px; text-align: left; text-transform: uppercase; }
        .jury-table td { padding: 9px; border-bottom: 1px solid #dce5ef; vertical-align: top; }
        .jury-table tr:nth-child(even) td { background: #f6f9fd; }
        .jury-table td:first-child { color: #245fb7; font-weight: bold; }
        .signatures { width: 100%; margin-top: 38px; border-collapse: separate; border-spacing: 10px 0; }
        .signatures td { width: 33.33%; height: 84px; padding: 8px; border-top: 1px solid #aebed1; color: #52647d; font-size: 8px; text-align: center; vertical-align: bottom; }
        .signatures strong { display: block; color: #26364f; font-size: 9px; }
        .document-footer { position: fixed; right: 0; bottom: -12mm; left: 0; padding-top: 5px; color: #7b899c; border-top: 1px solid #dce5ef; font-size: 7px; }
        .footer-right { float: right; }
    </style>
</head>
<body>
    <table class="document-header" role="presentation"><tr>
        <td width="45"><?php if ($logoDataUri): ?><img class="brand-logo" src="<?= $logoDataUri ?>" alt="Logo"><?php else: ?><div class="brand-mark"><?= $escape(mb_strtoupper(mb_substr($nomEtablissement, 0, 2))) ?></div><?php endif; ?></td>
        <td class="brand-copy"><strong><?= $escape($nomEtablissement) ?></strong><span><?= $escape($sousTitreEtablissement ?: 'Document administratif') ?></span><?php if ($coordonneesEtablissement): ?><div class="brand-contact"><?= $escape(implode('  •  ', $coordonneesEtablissement)) ?></div><?php endif; ?></td>
        <td class="document-reference"><strong>Procès-verbal</strong>Généré le <?= $dateGeneration ?></td>
    </tr></table>

    <div class="title-block">
        <p class="eyebrow">Soutenance de fin d'études</p>
        <h1>Procès-verbal de soutenance</h1>
        <div class="title-rule"></div>
    </div>

    <table class="summary" role="presentation">
        <tr><td><span class="summary-label">Année universitaire</span><span class="summary-value"><?= $escape($data['annee_univ']) ?></span></td><td><span class="summary-label">Niveau</span><span class="summary-value"><?= $escape($data['niveau']) ?></span></td></tr>
        <tr><td><span class="summary-label">Mention / parcours</span><span class="summary-value">Informatique / <?= $escape($data['parcours']) ?></span></td><td><span class="summary-label">Organisme d'accueil</span><span class="summary-value"><?= $escape($data['organisme_design']) ?> — <?= $escape($data['organisme_lieu']) ?></span></td></tr>
    </table>

    <p class="intro">
        L'étudiant(e) <strong><?= $escape($data['etudiant_nom']) ?> <?= $escape($data['etudiant_prenoms']) ?></strong>,
        matricule <strong><?= $escape($data['matricule']) ?></strong>, a soutenu publiquement son mémoire de fin d'études
        devant les membres du jury ci-dessous.
    </p>

    <table class="note-box" role="presentation"><tr><td><span class="note-label">Résultat attribué par le jury</span></td><td><div class="note-value"><?= $noteAffichee ?>/20</div><div class="note-words"><?= $escape($noteEnLettres) ?></div></td></tr></table>

    <div class="section-title"><span></span>Membres du jury</div>
    <table class="jury-table">
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

    <table class="signatures" role="presentation"><tr><td><strong>Le Président du jury</strong>Signature et cachet</td><td><strong>L'étudiant(e)</strong>Signature</td><td><strong>Le responsable</strong>Visa et cachet</td></tr></table>
    <div class="document-footer"><?= $escape($nomEtablissement) ?> <span class="footer-right">Procès-verbal — <?= $escape($data['matricule']) ?></span></div>
</body>
</html>
