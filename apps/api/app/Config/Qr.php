<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * QR dynamique : durée de vie lue depuis .env (QR_REFRESH_SECONDS).
 */
class Qr extends BaseConfig
{
    /**
     * Durée de validité d'un QR, en secondes, avant rotation.
     */
    public int $refreshSeconds = 15;

    public function __construct()
    {
        parent::__construct();

        $fromEnv = env('QR_REFRESH_SECONDS');
        if ($fromEnv === null || $fromEnv === '') {
            return;
        }

        $seconds = (int) $fromEnv;
        if ($seconds > 0) {
            $this->refreshSeconds = $seconds;
        }
    }
}
