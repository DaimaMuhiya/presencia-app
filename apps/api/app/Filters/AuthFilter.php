<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Vérifie le jeton d'accès avant d'entrer dans une route protégée.
 *
 * Usage dans les routes :
 * - 'filter' => 'auth'                     toute personne connectée et active
 * - 'filter' => 'auth:admin,super_admin'   seulement ces rôles
 *
 * Le filtre s'appuie sur le service auth, qui lit l'empreinte du jeton
 * en base. Un jeton expiré, révoqué ou inconnu est refusé.
 */
class AuthFilter implements FilterInterface
{
    /**
     * @param list<string>|null $arguments
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (! str_starts_with($header, 'Bearer ')) {
            return $this->deny(401, 'Jeton d\'accès manquant.');
        }

        $rawToken = trim(substr($header, 7));
        $user     = service('auth')->userFromAccessToken($rawToken);

        if ($user === null) {
            return $this->deny(401, 'Session expirée ou jeton invalide.');
        }

        $roles = $arguments ?? [];

        if ($roles !== [] && ! in_array($user['role'], $roles, true)) {
            return $this->deny(403, 'Vous n\'avez pas accès à cette action.');
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }

    private function deny(int $status, string $message): ResponseInterface
    {
        return service('response')
            ->setStatusCode($status)
            ->setJSON([
                'success' => false,
                'message' => $message,
            ]);
    }
}
