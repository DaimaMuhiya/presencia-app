<?php

namespace App\Models;

use App\Support\Uuid;

/**
 * Demande d'export de présences.
 *
 * La table ne garde que la période et le filtre. Les lignes renvoyées
 * au front sont calculées à partir des présences, pas stockées ici.
 */
class ExportModel extends AppModel
{
    protected $table            = 'exports';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'start_date',
        'end_date',
        'status_filter',
    ];

    protected $useTimestamps = false;

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
            'id'            => $row['id'],
            'start_date'    => $row['start_date'],
            'end_date'      => $row['end_date'],
            'status_filter' => $row['status_filter'],
            'created_at'    => $row['created_at'],
        ];
    }

    /**
     * Présences de la période, avec l'identité de l'employé.
     * Le front construit le fichier (CSV, Excel, PDF) à partir de ces lignes.
     *
     * @return list<array<string, mixed>>
     */
    public function rowsFor(string $startDate, string $endDate, ?string $statusFilter): array
    {
        $builder = $this->db->table('attendances a')
            ->select(
                'a.id AS attendance_id, a.user_id, a.attendance_date, a.arrival_at, a.departure_at, a.status, '
                . 'u.employee_code, u.first_name, u.last_name, u.work_email',
            )
            ->join('users u', 'u.id = a.user_id', 'inner')
            ->where('a.attendance_date >=', $startDate)
            ->where('a.attendance_date <=', $endDate)
            ->orderBy('a.attendance_date', 'ASC')
            ->orderBy('u.last_name', 'ASC')
            ->orderBy('u.first_name', 'ASC');

        if ($statusFilter !== null && $statusFilter !== '') {
            $builder->where('a.status', $statusFilter);
        }

        $rows = $builder->get()->getResultArray();

        return array_map(static function (array $row): array {
            return [
                'attendance_id'   => $row['attendance_id'],
                'attendance_date' => $row['attendance_date'],
                'status'          => $row['status'],
                'arrival_at'      => $row['arrival_at'],
                'departure_at'    => $row['departure_at'],
                'user_id'         => $row['user_id'],
                'employee_code'   => $row['employee_code'],
                'first_name'      => $row['first_name'],
                'last_name'       => $row['last_name'],
                'work_email'      => $row['work_email'],
            ];
        }, $rows);
    }
}
