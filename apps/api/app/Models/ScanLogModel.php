<?php

namespace App\Models;

use App\Support\Uuid;

class ScanLogModel extends AppModel
{
    protected $table            = 'scan_logs';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'attendance_id',
        'user_id',
        'qr_token_id',
        'method',
        'scanned_at',
        'is_success',
        'failure_reason',
    ];

    protected $beforeInsert = ['assignId'];

    /**
     * @param array<string, mixed> $event
     *
     * @return array<string, mixed>
     */
    protected function assignId(array $event): array
    {
        if (empty($event['data']['id'])) {
            $event['data']['id'] = Uuid::v4();
        }

        return $event;
    }

    /**
     * @param array<string, mixed> $row
     *
     * @return array<string, mixed>
     */
    public static function toPublic(array $row): array
    {
        return [
            'id'             => $row['id'],
            'attendance_id'  => $row['attendance_id'],
            'user_id'        => $row['user_id'],
            'qr_token_id'    => $row['qr_token_id'],
            'method'         => $row['method'],
            'scanned_at'     => $row['scanned_at'],
            'is_success'     => (bool) ($row['is_success'] ?? false),
            'failure_reason' => $row['failure_reason'],
        ];
    }
}
