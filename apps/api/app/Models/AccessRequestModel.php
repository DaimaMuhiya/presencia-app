<?php

namespace App\Models;

use App\Support\Timestamps;
use App\Support\Uuid;

/**
 * Demandes d'accès envoyées depuis l'écran de connexion.
 * Un administrateur les traitera plus tard (reviewed_by, reviewed_at).
 */
class AccessRequestModel extends AppModel
{
    protected $table            = 'access_requests';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'full_name',
        'work_email',
        'message',
        'status',
        'reviewed_by',
        'reviewed_at',
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

        if (empty($event['data']['status'])) {
            $event['data']['status'] = 'pending';
        }

        return $event;
    }

    /**
     * Vrai s'il existe déjà une demande en attente pour cet email.
     */
    public function hasPending(string $email): bool
    {
        return $this->where('work_email', mb_strtolower(trim($email)))
            ->where('status', 'pending')
            ->countAllResults() > 0;
    }
}
