<?php
/**
 * Email du code demandé à la connexion.
 *
 * @var string $firstName
 * @var string $code
 * @var int    $minutes
 */
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Votre code de connexion Presencia</title>
    <style>
        @media (prefers-color-scheme: dark) {
            .bg-page  { background-color: #0F172A !important; }
            .bg-card  { background-color: #1E293B !important; }
            .bg-code  { background-color: #0F172A !important; border-color: #334155 !important; }
            .bg-note  { background-color: #0F172A !important; }
            .txt-main { color: #F1F5F9 !important; }
            .txt-soft { color: #94A3B8 !important; }
            .txt-code { color: #A5B4FC !important; }
        }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; }
            .px-card   { padding-left: 24px !important; padding-right: 24px !important; }
            .code      { font-size: 30px !important; letter-spacing: 6px !important; }
        }
    </style>
</head>
<body class="bg-page" style="margin:0; padding:0; background-color:#F1F5F9; -webkit-text-size-adjust:100%;">

    <!-- Texte d'aperçu (préheader) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        Votre code de connexion : <?= esc($code) ?> — valable <?= esc((string) $minutes) ?> minutes.
    </div>

    <table role="presentation" class="bg-page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1F5F9;">
        <tr>
            <td align="center" style="padding:40px 16px;">

                <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:560px;">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" valign="middle" width="40" height="40" style="width:40px; height:40px; background-color:#4F46E5; border-radius:12px; color:#FFFFFF; font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:20px; font-weight:700;">P</td>
                                    <td style="padding-left:12px; font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:20px; font-weight:700; color:#0F172A;" class="txt-main">Presencia</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Carte -->
                    <tr>
                        <td class="bg-card px-card" style="background-color:#FFFFFF; border-radius:20px; padding:40px 40px 36px; font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

                            <!-- Icône -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                                <tr>
                                    <td align="center" valign="middle" width="56" height="56" style="width:56px; height:56px; background-color:#EEF2FF; border-radius:16px; font-size:26px;">🔐</td>
                                </tr>
                            </table>

                            <h1 class="txt-main" style="margin:0 0 8px; font-size:24px; line-height:32px; font-weight:700; color:#0F172A;">
                                Code de connexion
                            </h1>
                            <p class="txt-soft" style="margin:0 0 28px; font-size:16px; line-height:26px; color:#475569;">
                                Bonjour <strong class="txt-main" style="color:#0F172A;"><?= esc($firstName) ?></strong>,<br>
                                saisissez le code ci-dessous pour terminer votre connexion à Presencia.
                            </p>

                            <!-- Code -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="bg-code" align="center" style="background-color:#F8FAFC; border:2px dashed #C7D2FE; border-radius:16px; padding:24px 16px;">
                                        <div class="code txt-code" style="font-family:'SFMono-Regular',Menlo,Consolas,'Courier New',monospace; font-size:36px; line-height:44px; font-weight:700; letter-spacing:10px; color:#4F46E5; padding-left:10px;">
                                            <?= esc($code) ?>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiration -->
                            <p class="txt-soft" style="margin:20px 0 0; text-align:center; font-size:14px; line-height:22px; color:#64748B;">
                                ⏱&nbsp; Ce code expire dans <strong><?= esc((string) $minutes) ?> minutes</strong>.
                            </p>

                            <!-- Note de sécurité -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                                <tr>
                                    <td class="bg-note" style="background-color:#F8FAFC; border-left:4px solid #4F46E5; border-radius:8px; padding:14px 16px;">
                                        <p class="txt-soft" style="margin:0; font-size:13px; line-height:20px; color:#64748B;">
                                            <strong class="txt-main" style="color:#0F172A;">Ce n'était pas vous ?</strong><br>
                                            Ignorez simplement ce message. Ne le partagez jamais.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Pied de page -->
                    <tr>
                        <td align="center" style="padding:24px 16px 0; font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                            <p class="txt-soft" style="margin:0; font-size:12px; line-height:18px; color:#94A3B8;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                                &copy; <?= date('Y') ?> Presencia. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>