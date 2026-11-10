<?php

namespace App\Models;

/**
 * Journal des actions sensibles.
 *
 * Pour l'authentification, on y note les connexions, les échecs,
 * les déconnexions et les changements de mot de passe.
 * On n'y écrit jamais un mot de passe ni un jeton.
 */
class AuditLogModel extends AppModel
{
    protected $table            = 'audit_logs';
    protected $primaryKey       = 'id';
    protected $returnType       = 'array';
    protected $useAutoIncrement = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'user_id',
        'category',
        'action',
        'entity',
        'entity_id',
        'details',
    ];

    protected $useTimestamps = false;

    /**
     * @param array<string, mixed> $details
     */
    public function record(
        ?string $userId,
        string $category,
        string $action,
        ?string $entity = null,
        ?string $entityId = null,
        array $details = [],
    ): void {
        // details est une colonne JSON. On y passe une chaîne JSON valide.
        $this->insert([
            'user_id'   => $userId,
            'category'  => $category,
            'action'    => $action,
            'entity'    => $entity,
            'entity_id' => $entityId,
            'details'   => json_encode($details, JSON_THROW_ON_ERROR),
        ]);
    }
}
