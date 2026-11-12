<?php

namespace App\Controllers\Api\V1;

use App\Models\AttendanceModel;
use App\Models\ScanLogModel;
use App\Support\AttendanceListFilters;
use OpenApi\Spec as OA;

/**
 * Consultation des présences et scans (super_admin).
 */
class AttendancesController extends ApiController
{
    #[OA\Operation\Get(
        path: '/api/v1/super-admin/attendances',
        operationId: 'listAttendances',
        tags: ['Présence'],
        summary: 'Lister les présences',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Query(name: 'date', description: 'Un jour (AAAA-MM-JJ). Ignoré si from/to, month ou week est fourni.', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter\Query(name: 'month', description: 'Mois calendaire (AAAA-MM).', schema: new OA\Schema(type: 'string', example: '2026-11')),
            new OA\Parameter\Query(name: 'week', description: 'Semaine ISO (AAAA-Www, ex. 2026-W46).', schema: new OA\Schema(type: 'string', example: '2026-W46')),
            new OA\Parameter\Query(name: 'from', description: 'Début d\'intervalle (AAAA-MM-JJ).', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter\Query(name: 'to', description: 'Fin d\'intervalle (AAAA-MM-JJ).', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter\Query(name: 'user_id', schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter\Query(name: 'status', schema: new OA\Schema(type: 'string', enum: ['on_time', 'late', 'absent', 'exception'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Présences.', content: new OA\Schema(ref: '#/components/schemas/AttendanceListResponse')),
            new OA\Response(response: 401, description: 'Jeton invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Accès refusé.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function index()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $range = AttendanceListFilters::resolve($this->request->getGet() ?? []);
        if (isset($range['error'])) {
            return $this->failMessage($range['error'], 422);
        }

        $model = model(AttendanceModel::class);
        AttendanceListFilters::applyToModel($model, $range);

        $userId = trim((string) ($this->request->getGet('user_id') ?? ''));
        if ($userId !== '') {
            $model->where('user_id', $userId);
        }

        $status = trim((string) ($this->request->getGet('status') ?? ''));
        if ($status !== '' && in_array($status, ['on_time', 'late', 'absent', 'exception'], true)) {
            $model->where('status', $status);
        }

        $rows = $model->orderBy('attendance_date', 'DESC')->findAll();

        $data = [
            'attendances' => array_map(AttendanceModel::toPublic(...), $rows),
        ];
        if (($range['from'] ?? null) !== null || ($range['to'] ?? null) !== null) {
            $data['period'] = [
                'from' => $range['from'],
                'to'   => $range['to'],
            ];
        }

        return $this->ok('Présences chargées.', $data);
    }

    #[OA\Operation\Get(
        path: '/api/v1/super-admin/scan-logs',
        operationId: 'listScanLogs',
        tags: ['Présence'],
        summary: 'Journal des scans',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Query(name: 'date', description: 'Jour (AAAA-MM-JJ, filtre sur scanned_at).', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter\Query(name: 'user_id', schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter\Query(name: 'is_success', schema: new OA\Schema(type: 'boolean')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Scans.', content: new OA\Schema(ref: '#/components/schemas/ScanLogListResponse')),
            new OA\Response(response: 401, description: 'Jeton invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Accès refusé.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function scanLogs()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $model = model(ScanLogModel::class);

        $date = trim((string) ($this->request->getGet('date') ?? ''));
        if ($date !== '' && preg_match('/\A\d{4}-\d{2}-\d{2}\z/', $date) === 1) {
            $model->where('DATE(scanned_at)', $date);
        }

        $userId = trim((string) ($this->request->getGet('user_id') ?? ''));
        if ($userId !== '') {
            $model->where('user_id', $userId);
        }

        $success = $this->request->getGet('is_success');
        if ($success !== null && $success !== '') {
            $parsed = filter_var($success, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($parsed !== null) {
                $model->where('is_success', $parsed ? 1 : 0);
            }
        }

        $rows = $model->orderBy('scanned_at', 'DESC')->findAll(200);

        return $this->ok('Scans chargés.', [
            'scan_logs' => array_map(ScanLogModel::toPublic(...), $rows),
        ]);
    }

    private function denied()
    {
        $actor = service('auth')->currentUser();

        if (! is_array($actor) || ($actor['role'] ?? '') !== 'super_admin') {
            return $this->failMessage('Vous n\'avez pas accès à cette action.', 403);
        }

        return null;
    }
}
