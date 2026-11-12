<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use Config\Services;

/**
 * Fait tourner le QR dès qu'il est expiré ou absent.
 *
 * Planification recommandée (rotation toutes les QR_REFRESH_SECONDS, ex. 15 s) :
 *
 *   * * * * * cd /chemin/vers/apps/api && php spark qr:rotate
 *   * * * * * sleep 15 && cd /chemin/vers/apps/api && php spark qr:rotate
 *   * * * * * sleep 30 && cd /chemin/vers/apps/api && php spark qr:rotate
 *   * * * * * sleep 45 && cd /chemin/vers/apps/api && php spark qr:rotate
 */
class QrRotate extends BaseCommand
{
    protected $group       = 'Qr';
    protected $name        = 'qr:rotate';
    protected $description = 'Replace the current QR when expired (for cron).';
    protected $usage       = 'qr:rotate';

    public function run(array $params): void
    {
        $result = Services::qrRotation()->rotateIfExpired();

        if ($result['rotated']) {
            CLI::write('QR rotation: a new code was issued.', 'green');

            return;
        }

        CLI::write('QR rotation: current code is still valid; no change.', 'yellow');
    }
}
