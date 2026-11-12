<?php

namespace App\Models;

class QrTokenModel extends AppModel
{
    protected $table            = 'qr_tokens';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'hash_id',
        'salt',
        'issued_at',
        'expires_at',
        'consumed_at',
    ];
}
