<?php

namespace App\Controllers\Api\V1;

use Config\Services;
use OpenApi\Spec as OA;

/**
 * Affichage et consommation des QR (le remplacement après scan est immédiat, hors cron).
 */
class QrController extends ApiController
{
    #[OA\Operation\Get(
        path: '/api/v1/qr/current',
        operationId: 'qrCurrent',
        tags: ['QR dynamique'],
        summary: 'QR actuellement valide',
        description: <<<'MD'
Retourne le jeton QR affichable. S'il n'existe pas encore de jeton actif (non consommé et non expiré), un nouveau est créé à la volée.

**Affichage** : encoder `data.qr.hash_id` dans l'image QR (chaîne brute). Rafraîchir l'affichage quand `expires_at` est dépassé ou quand `hash_id` change.

**Rotation planifiée** : commande `php spark qr:rotate` (cron, typiquement toutes les 15 s selon `QR_REFRESH_SECONDS`).
MD,
        responses: [
            new OA\Response(response: 200, description: 'Jeton courant.', content: new OA\Schema(ref: '#/components/schemas/QrCurrentResponse')),
            new OA\Response(response: 500, description: 'Génération impossible.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function current()
    {
        $qr = Services::qrRotation()->current();
        if ($qr === null) {
            return $this->failMessage('Impossible de générer un QR.', 500);
        }

        return $this->ok('QR actuel.', ['qr' => $qr]);
    }

    #[OA\Operation\Post(
        path: '/api/v1/qr/consume',
        operationId: 'qrConsume',
        tags: ['QR dynamique'],
        summary: 'Consommer un QR après scan',
        description: <<<'MD'
Marque le jeton comme utilisé (`consumed_at`) et émet immédiatement un nouveau jeton dans `data.replacement` pour l'écran suivant.

Le QR doit être encore valide (non expiré, non déjà consommé). Alias de corps accepté : `hashId`.
MD,
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/QrConsumeRequest')),
        responses: [
            new OA\Response(response: 200, description: 'QR consommé et remplacé.', content: new OA\Schema(ref: '#/components/schemas/QrConsumeResponse')),
            new OA\Response(response: 400, description: 'QR inconnu, expiré ou déjà utilisé.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: '`hash_id` absent.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
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
