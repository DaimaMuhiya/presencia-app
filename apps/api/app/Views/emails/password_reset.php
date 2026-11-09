<?php
/**
 * Email du code de réinitialisation.
 *
 * @var string $firstName
 * @var string $code
 * @var int    $minutes
 */
?>
<p>Bonjour <?= esc($firstName) ?>,</p>
<p>Voici votre code pour choisir un nouveau mot de passe Presencia :</p>
<p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;"><?= esc($code) ?></p>
<p>Ce code expire dans <?= esc((string) $minutes) ?> minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
