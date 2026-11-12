<?php

namespace App\Controllers\Api\V1;

use Config\Services;

/**
 * Affichage et consommation des QR (le remplacement après scan est immédiat, hors cron).
 */
class QrController extends ApiController
{
    /**
     * QR actuellement valide (création à la volée si besoin).
     */
    public function current()
    {
        $qr = Services::qrRotation()->current();
        if ($qr === null) {
            return $this->failMessage('Impossible de générer un QR.', 500);
        }

        return $this->ok('QR actuel.', ['qr' => $qr]);
    }

    /**
     * Scan réussi : consomme le jeton et renvoie le QR de remplacement.
     */
    public function consume()
    {
        $payload = $this->request->getJSON(true);
        if (! is_array($payload)) {
            $payload = $this->request->getPost();
        }

        $hashId = trim((string) ($payload['hash_id'] ?? $payload['hashId'] ?? ''));
        if ($hashId === '') {
            return $this->failMessage('Le champ hash_id est requis.', 422, [
                'hash_id' => 'Requis.',
            ]);
        }

        $result = Services::qrRotation()->consumeAndReplace($hashId);
        if ($result === null) {
            return $this->failMessage('QR invalide, expiré ou déjà utilisé.', 400);
        }

        return $this->ok('QR consommé.', $result);
    }
}
