<?php

namespace App\Controllers\Api\V1;

use App\Models\AttendanceModel;
use App\Support\AttendanceListFilters;
use Config\Services;
use Config\Validation;
use OpenApi\Spec as OA;

/**
 * Pointage employé (scan QR).
 */
class AttendanceController extends ApiController
{
    #[OA\Operation\Post(
        path: '/api/v1/attendance/punch',
        operationId: 'attendancePunch',
        tags: ['Présence'],
        summary: 'Pointer (scan QR)',
        description: 'Utilisateur connecté (employé ou super admin), compte actif. 1er scan du jour : arrivée. 2e : départ. Consomme le QR et en émet un nouveau. Pas de GPS.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/AttendancePunchRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Pointage enregistré.', content: new OA\Schema(ref: '#/components/schemas/AttendancePunchResponse')),
            new OA\Response(response: 400, description: 'QR ou pointage invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant ou invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Rôle non autorisé ou compte inactif.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 503, description: 'Horaire entreprise non configuré.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function punch()
    {
        $user = service('auth')->currentUser();
        if (! is_array($user)) {
            return $this->failMessage('Session invalide.', 401);
        }

        $input = $this->request->getJSON(true);
        if (! is_array($input)) {
            $input = $this->request->getPost();
        }

        if (! array_key_exists('hash_id', $input) && array_key_exists('hashId', $input)) {
            $input['hash_id'] = $input['hashId'];
        }

        if (! $this->validateData($input, config(Validation::class)->attendancePunch)) {
            return $this->failMessage(
                'Les informations envoyées sont incomplètes ou invalides.',
                422,
                $this->validator->getErrors(),
            );
        }

        $result = Services::attendancePunch()->punch($user, (string) $input['hash_id']);

        if (! $result['ok']) {
            return $this->failMessage($result['message'], $result['status']);
        }

        $type = $result['data']['punch_type'] === 'arrival' ? 'Arrivée' : 'Départ';

        return $this->ok($type . ' enregistrée.', $result['data']);
    }

    #[OA\Operation\Get(
        path: '/api/v1/attendance/me',
        operationId: 'myAttendances',
        tags: ['Présence'],
        summary: 'Mes présences',
        description: 'Historique du compte connecté. Filtres de période : month (AAAA-MM), week (AAAA-Www), ou from/to (AAAA-MM-JJ). Priorité : from/to, puis month, puis week.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Query(name: 'month', schema: new OA\Schema(type: 'string', example: '2026-11')),
            new OA\Parameter\Query(name: 'week', schema: new OA\Schema(type: 'string', example: '2026-W46')),
            new OA\Parameter\Query(name: 'from', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter\Query(name: 'to', schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Liste des présences.', content: new OA\Schema(ref: '#/components/schemas/AttendanceListResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant ou invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function myAttendances()
    {
        $user = service('auth')->currentUser();
        if (! is_array($user)) {
            return $this->failMessage('Session invalide.', 401);
        }

        $range = AttendanceListFilters::resolve($this->request->getGet() ?? []);
        if (isset($range['error'])) {
            return $this->failMessage($range['error'], 422);
        }

        $model = model(AttendanceModel::class)->where('user_id', (string) $user['id']);
        AttendanceListFilters::applyToModel($model, $range);

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
}
