<?php

namespace App\Libraries;

use App\Models\AttendanceModel;
use App\Models\QrTokenModel;
use App\Models\ScanLogModel;
use App\Models\ScheduleModel;
use App\Support\Timestamps;
use App\Support\Uuid;
use CodeIgniter\Database\BaseConnection;
use CodeIgniter\I18n\Time;

/**
 * Pointage QR : 1er scan du jour = arrivée, 2e = départ (pas de GPS).
 */
class AttendancePunchService
{
    public function __construct(
        private ?AttendanceModel $attendances = null,
        private ?ScanLogModel $scanLogs = null,
        private ?QrTokenModel $qrTokens = null,
        private ?ScheduleModel $schedules = null,
        private ?QrRotationService $qrRotation = null,
        private ?BaseConnection $db = null,
    ) {
        $this->attendances ??= model(AttendanceModel::class);
        $this->scanLogs      ??= model(ScanLogModel::class);
        $this->qrTokens      ??= model(QrTokenModel::class);
        $this->schedules     ??= model(ScheduleModel::class);
        $this->qrRotation    ??= new QrRotationService();
        $this->db            ??= db_connect();
    }

    /**
     * @param array<string, mixed> $user
     *
     * @return array{ok: true, data: array<string, mixed>}|array{ok: false, status: int, message: string, reason: string}
     */
    public function punch(array $user, string $hashId): array
    {
        $hashId = trim($hashId);
        if ($hashId === '') {
            return $this->fail(422, 'Le QR est requis.', 'hash_id_missing');
        }

        $role = (string) ($user['role'] ?? '');
        if (! in_array($role, ['employee', 'super_admin'], true)) {
            return $this->fail(403, 'Ce rôle ne peut pas pointer.', 'role_not_allowed');
        }

        if (($user['employment_status'] ?? '') !== 'active') {
            return $this->fail(403, 'Ce compte ne peut pas pointer.', 'account_inactive');
        }

        $schedule = $this->resolveCompanySchedule();
        if ($schedule === null) {
            return $this->fail(503, 'Aucun horaire entreprise n\'est configuré.', 'no_company_schedule');
        }

        $userId   = (string) $user['id'];
        $today    = Time::now('UTC')->toDateString();
        $now      = Timestamps::now();
        $existing = $this->attendances->findForUserAndDate($userId, $today);

        $punchType = $this->resolvePunchType($existing);
        if ($punchType === 'closed') {
            $this->recordScan($userId, null, null, $now, false, 'already_clocked_out');

            return $this->fail(400, 'Arrivée et départ sont déjà enregistrés pour aujourd\'hui.', 'already_clocked_out');
        }

        $token = $this->qrTokens->where('hash_id', $hashId)->first();
        if ($token === null) {
            $this->recordScan($userId, null, null, $now, false, 'qr_unknown');

            return $this->fail(400, 'QR inconnu.', 'qr_unknown');
        }

        if ($token['consumed_at'] !== null) {
            $this->recordScan($userId, null, (string) $token['id'], $now, false, 'qr_already_used');

            return $this->fail(400, 'Ce QR a déjà été utilisé.', 'qr_already_used');
        }

        if (strtotime((string) $token['expires_at']) < time()) {
            $this->recordScan($userId, null, (string) $token['id'], $now, false, 'qr_expired');

            return $this->fail(400, 'Ce QR est expiré.', 'qr_expired');
        }

        $this->db->transStart();

        $this->qrTokens->update($token['id'], ['consumed_at' => $now]);
        $this->qrRotation->issueNextToken();

        $attendance = $existing;
        if ($punchType === 'arrival') {
            $status = $this->arrivalStatus($today, $now, $schedule);
            if ($attendance === null) {
                $attendance = [
                    'id'               => Uuid::v4(),
                    'user_id'          => $userId,
                    'schedules_id'     => $schedule['id'],
                    'attendance_date'  => $today,
                    'arrival_at'       => $now,
                    'departure_at'     => null,
                    'status'           => $status,
                ];
                $this->attendances->insert($attendance);
            } else {
                $this->attendances->update($attendance['id'], [
                    'arrival_at'   => $now,
                    'schedules_id' => $schedule['id'],
                    'status'       => $status,
                ]);
                $attendance['arrival_at']   = $now;
                $attendance['schedules_id'] = $schedule['id'];
                $attendance['status']       = $status;
            }
        } else {
            $this->attendances->update((string) $attendance['id'], ['departure_at' => $now]);
            $attendance['departure_at'] = $now;
        }

        $this->recordScan(
            $userId,
            (string) $attendance['id'],
            (string) $token['id'],
            $now,
            true,
            null,
        );

        $this->db->transComplete();

        if (! $this->db->transStatus()) {
            return $this->fail(500, 'Le pointage n\'a pas pu être enregistré.', 'database_error');
        }

        $freshQr = $this->qrRotation->current();

        return [
            'ok'   => true,
            'data' => [
                'punch_type' => $punchType,
                'attendance' => AttendanceModel::toPublic($attendance),
                'qr'         => $freshQr,
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function resolveCompanySchedule(): ?array
    {
        $row = $this->schedules->orderBy('start_time', 'ASC')->first();

        return is_array($row) ? $row : null;
    }

    /**
     * @param array<string, mixed>|null $attendance
     */
    private function resolvePunchType(?array $attendance): string
    {
        if ($attendance === null || ($attendance['arrival_at'] ?? null) === null) {
            return 'arrival';
        }

        if (($attendance['departure_at'] ?? null) === null) {
            return 'departure';
        }

        return 'closed';
    }

    /**
     * @param array<string, mixed> $schedule
     */
    private function arrivalStatus(string $date, string $arrivalAt, array $schedule): string
    {
        $start = ScheduleModel::normalizeTime((string) $schedule['start_time']);
        $grace = (int) ($schedule['grace_minutes'] ?? 0);
        $deadline = strtotime($date . ' ' . $start . ' +' . $grace . ' minutes');
        $arrival  = strtotime($arrivalAt);

        if ($arrival <= $deadline) {
            return 'on_time';
        }

        return 'late';
    }

    private function recordScan(
        string $userId,
        ?string $attendanceId,
        ?string $qrTokenId,
        string $scannedAt,
        bool $success,
        ?string $failureReason,
    ): void {
        $this->scanLogs->insert([
            'user_id'        => $userId,
            'attendance_id'  => $attendanceId,
            'qr_token_id'    => $qrTokenId,
            'method'         => 'qr_scan',
            'scanned_at'     => $scannedAt,
            'is_success'     => $success ? 1 : 0,
            'failure_reason' => $failureReason,
        ]);
    }

    /**
     * @return array{ok: false, status: int, message: string, reason: string}
     */
    private function fail(int $status, string $message, string $reason): array
    {
        return [
            'ok'      => false,
            'status'  => $status,
            'message' => $message,
            'reason'  => $reason,
        ];
    }

}
