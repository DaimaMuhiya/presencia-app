<?php

namespace App\Models;

use App\Support\Uuid;

class AttendanceModel extends AppModel
{
    protected $table            = 'attendances';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'user_id',
        'schedules_id',
        'attendance_date',
        'arrival_at',
        'departure_at',
        'status',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

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
            'id'               => $row['id'],
            'user_id'          => $row['user_id'],
            'schedules_id'     => $row['schedules_id'],
            'attendance_date'  => $row['attendance_date'],
            'arrival_at'       => $row['arrival_at'],
            'departure_at'     => $row['departure_at'],
            'status'           => $row['status'],
        ];
    }

    public function findForUserAndDate(string $userId, string $date): ?array
    {
        $row = $this->where('user_id', $userId)
            ->where('attendance_date', $date)
            ->first();

        return is_array($row) ? $row : null;
    }
}
