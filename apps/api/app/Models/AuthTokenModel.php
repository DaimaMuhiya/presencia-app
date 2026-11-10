<?php

namespace App\Models;

use App\Support\Timestamps;
use App\Support\Uuid;
use CodeIgniter\Database\RawSql;

/**
 * Jetons d'accès, de renouvellement et de réinitialisation.
 *
 * Le schéma décrit l'énumération token_type, mais pas la table.
 * Cette table la met en œuvre. used_at rempli signifie que le jeton
 * ne peut plus servir (utilisé, tourné ou révoqué).
 */
class AuthTokenModel extends AppModel
{
    protected $table            = 'auth_tokens';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'user_id',
        'type',
        'token_hash',
        'expires_at',
        'used_at',
    ];

    protected $useTimestamps = false;

    protected $beforeInsert = ['prepareInsert'];

    /**
     * @param array<string, mixed> $event
     *
     * @return array<string, mixed>
     */
    protected function prepareInsert(array $event): array
    {
        if (empty($event['data']['id'])) {
            $event['data']['id'] = Uuid::v4();
        }

        if (empty($event['data']['created_at'])) {
            $event['data']['created_at'] = Timestamps::now();
        }

        return $event;
    }

    /**
     * Jeton encore utilisable : pas consommé, et pas expiré.
     *
     * @return array<string, mixed>|null
     */
    public function findActiveByHash(string $hash, string $type): ?array
    {
        $row = $this->where('token_hash', $hash)
            ->where('type', $type)
            ->where('used_at', null)
            ->where(new RawSql('expires_at > NOW()'))
            ->first();

        return is_array($row) ? $row : null;
    }

    /**
     * Jeton connu, même s'il a déjà été utilisé.
     * Sert à détecter la réutilisation d'un jeton de renouvellement.
     *
     * @return array<string, mixed>|null
     */
    public function findByHash(string $hash, string $type): ?array
    {
        $row = $this->where('token_hash', $hash)
            ->where('type', $type)
            ->first();

        return is_array($row) ? $row : null;
    }

    public function revoke(string $id): void
    {
        $this->update($id, ['used_at' => Timestamps::now()]);
    }

    /**
     * Rend tous les jetons encore valides d'une personne inutilisables.
     * Appelé quand un jeton de renouvellement déjà tourné est représenté :
     * c'est le signe qu'il a peut-être été volé.
     */
    public function revokeAllForUser(string $userId): void
    {
        $this->builder()
            ->where('user_id', $userId)
            ->where('used_at', null)
            ->update(['used_at' => Timestamps::now()]);
    }
}
