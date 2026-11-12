<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Réglages de l'authentification.
 *
 * Les durées sont en secondes. MINUTE, HOUR et DAY sont des constantes
 * déjà fournies par CodeIgniter. La durée du jeton d'accès se règle
 * dans `.env` via `AUTH_ACCESS_TOKEN_TTL_SECONDS`.
 */
class Auth extends BaseConfig
{
    /**
     * Durée du jeton d'accès envoyé dans l'en-tête Authorization.
     * Courte : s'il est volé, il devient vite inutilisable.
     */
    public int $accessTokenTtl = 15 * MINUTE;

    public function __construct()
    {
        parent::__construct();

        $fromEnv = env('AUTH_ACCESS_TOKEN_TTL_SECONDS');
        if ($fromEnv === null || $fromEnv === '') {
            return;
        }

        $seconds = (int) $fromEnv;
        if ($seconds > 0) {
            $this->accessTokenTtl = $seconds;
        }
    }

    /**
     * Durée du jeton de renouvellement, sans la case « garder ma session ».
     */
    public int $refreshTokenTtl = 12 * HOUR;

    /**
     * Durée du jeton de renouvellement quand l'utilisateur coche « garder ma session ».
     */
    public int $rememberRefreshTokenTtl = 30 * DAY;

    /**
     * Durée du code à 6 chiffres envoyé pour réinitialiser le mot de passe.
     */
    public int $passwordResetTtl = 15 * MINUTE;

    /**
     * Durée du défi de connexion et du code envoyé par email.
     * Passé ce délai, il faut ressaisir le mot de passe.
     */
    public int $loginChallengeTtl = 10 * MINUTE;

    /**
     * Nombre de codes incorrects acceptés pour un même défi.
     * Au-delà, le défi est annulé.
     */
    public int $loginOtpMaxAttempts = 5;

    /**
     * Nombre de tentatives de connexion autorisées pour une même adresse IP et un même email.
     */
    public int $loginAttempts = 5;

    /**
     * Fenêtre de temps de ces tentatives de connexion.
     */
    public int $loginWindow = 15 * MINUTE;

    /**
     * Nombre de demandes de code (mot de passe oublié) autorisées.
     */
    public int $resetAttempts = 3;

    /**
     * Fenêtre de temps de ces demandes de code.
     */
    public int $resetWindow = HOUR;
}
