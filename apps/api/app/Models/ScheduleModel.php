<?php

namespace App\Models;

use App\Support\Uuid;

class ScheduleModel extends AppModel
{
    protected $table            = 'schedules';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'start_time',
        'end_time',
        'grace_minutes',
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
    public static function normalizeTime(string $time): string
    {
        return self::formatTime(trim($time));
    }

    /**
     * @param array<string, mixed> $row
     *
     * @return array<string, mixed>
     */
    public static function toPublic(array $row): array
    {
        $start = self::formatTime((string) ($row['start_time'] ?? ''));
        $end   = self::formatTime((string) ($row['end_time'] ?? ''));

        return [
            'id'             => $row['id'],
            'start_time'     => $start,
            'end_time'       => $end,
            'startTime'      => $start,
            'endTime'        => $end,
            'grace_minutes'  => (int) ($row['grace_minutes'] ?? 0),
            'graceMinutes'   => (int) ($row['grace_minutes'] ?? 0),
        ];
    }

    private static function formatTime(string $time): string
    {
        if ($time === '') {
            return $time;
        }

        if (preg_match('/\A(\d{1,2}):(\d{2})(?::(\d{2}))?\z/', $time, $matches) === 1) {
            $h = (int) $matches[1];
            $m = $matches[2];
            $s = $matches[3] ?? '00';

            return sprintf('%02d:%s:%s', $h, $m, $s);
        }

        return $time;
    }
}
