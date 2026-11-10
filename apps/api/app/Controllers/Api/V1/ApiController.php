<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\RESTful\ResourceController;

/**
 * Réponse JSON commune à toute l'API.
 *
 * success   : l'action a abouti
 * message   : phrase lisible
 * data      : le contenu, quand il y en a un
 * errors    : le détail champ par champ, quand la saisie est invalide
 */
abstract class ApiController extends ResourceController
{
    protected $format = 'json';

    /**
     * @param array<string, mixed>|null $data
     */
    protected function ok(string $message, ?array $data = null, int $status = 200)
    {
        return $this->respond([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * @param array<string, string> $errors
     */
    protected function failMessage(string $message, int $status = 400, array $errors = [])
    {
        $body = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== []) {
            $body['errors'] = $errors;
        }

        return $this->respond($body, $status);
    }
}
