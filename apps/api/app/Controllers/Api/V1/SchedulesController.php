<?php

namespace App\Controllers\Api\V1;

use App\Models\AuditLogModel;
use App\Models\ScheduleModel;
use App\Support\Uuid;
use Config\Validation;
use OpenApi\Spec as OA;

/**
 * Modèles d'horaires. Réservé au super_admin.
 */
class SchedulesController extends ApiController
{
    private const UUID = '/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i';

    #[OA\Operation\Get(
        path: '/api/v1/super-admin/schedules',
        operationId: 'listSchedules',
        tags: ['Horaires'],
        summary: 'Lister les horaires',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        responses: [
            new OA\Response(response: 200, description: 'Liste des horaires.', content: new OA\Schema(ref: '#/components/schemas/ScheduleListResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function index()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $rows = model(ScheduleModel::class)
            ->orderBy('start_time', 'ASC')
            ->findAll();

        return $this->ok('Horaires chargés.', [
            'schedules' => array_map(ScheduleModel::toPublic(...), $rows),
        ]);
    }

    #[OA\Operation\Post(
        path: '/api/v1/super-admin/schedules',
        operationId: 'createSchedule',
        tags: ['Horaires'],
        summary: 'Créer un horaire',
        description: 'Alias acceptés : startTime, endTime, graceMinutes. L\'heure de fin doit être après l\'heure de début (même jour).',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/ScheduleWriteRequest')),
        responses: [
            new OA\Response(response: 201, description: 'Horaire créé.', content: new OA\Schema(ref: '#/components/schemas/ScheduleItemResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function create()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->scheduleCreate)) {
            return $this->invalidInput();
        }

        $row = $this->columns($input, true);

        if ($error = $this->timeRangeError($row['start_time'], $row['end_time'])) {
            return $error;
        }

        $model = model(ScheduleModel::class);

        $row['id'] = Uuid::v4();

        if ($model->insert($row) === false) {
            return $this->failMessage('L\'horaire n\'a pas pu être créé.', 500);
        }

        $created = $model->find($row['id']);

        if (! is_array($created)) {
            return $this->failMessage('L\'horaire n\'a pas pu être créé.', 500);
        }

        $this->audit('schedule_created', (string) $created['id'], [
            'start_time'    => $created['start_time'],
            'end_time'      => $created['end_time'],
            'grace_minutes' => $created['grace_minutes'],
        ]);

        return $this->ok('Horaire créé.', [
            'schedule' => ScheduleModel::toPublic($created),
        ], 201);
    }

    #[OA\Operation\Put(
        path: '/api/v1/super-admin/schedules/{id}',
        operationId: 'updateSchedule',
        tags: ['Horaires'],
        summary: 'Modifier un horaire',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Path(name: 'id', description: 'Identifiant de l\'horaire.', schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/ScheduleWriteRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Horaire modifié.', content: new OA\Schema(ref: '#/components/schemas/ScheduleItemResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 404, description: 'Horaire introuvable.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function update($id = null)
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $id       = (string) $id;
        $existing = $this->findSchedule($id);

        if ($existing === null) {
            return $this->notFound();
        }

        $input = $this->input();

        if ($input === []) {
            return $this->failMessage('Aucun champ à modifier.', 422);
        }

        if (! $this->validateData($input, config(Validation::class)->scheduleUpdate())) {
            return $this->invalidInput();
        }

        $row = $this->columns($input, false);

        if ($row === []) {
            return $this->failMessage('Aucun champ à modifier.', 422);
        }

        $start = $row['start_time'] ?? $existing['start_time'];
        $end   = $row['end_time'] ?? $existing['end_time'];

        if ($error = $this->timeRangeError((string) $start, (string) $end)) {
            return $error;
        }

        $model = model(ScheduleModel::class);

        if ($model->update($id, $row) === false) {
            return $this->failMessage('L\'horaire n\'a pas pu être modifié.', 500);
        }

        $updated = $model->find($id);

        if (! is_array($updated)) {
            return $this->notFound();
        }

        $this->audit('schedule_updated', $id, $row);

        return $this->ok('Horaire modifié.', [
            'schedule' => ScheduleModel::toPublic($updated),
        ]);
    }

    #[OA\Operation\Delete(
        path: '/api/v1/super-admin/schedules/{id}',
        operationId: 'deleteSchedule',
        tags: ['Horaires'],
        summary: 'Supprimer un horaire',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Path(name: 'id', description: 'Identifiant de l\'horaire.', schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Horaire supprimé.', content: new OA\Schema(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 404, description: 'Horaire introuvable.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function delete($id = null)
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $id       = (string) $id;
        $existing = $this->findSchedule($id);

        if ($existing === null) {
            return $this->notFound();
        }

        if (model(ScheduleModel::class)->delete($id) === false) {
            return $this->failMessage('L\'horaire n\'a pas pu être supprimé.', 500);
        }

        $this->audit('schedule_deleted', $id, [
            'start_time' => $existing['start_time'],
            'end_time'   => $existing['end_time'],
        ]);

        return $this->ok('Horaire supprimé.', null);
    }

    private function denied()
    {
        $actor = service('auth')->currentUser();

        if (! is_array($actor) || ($actor['role'] ?? '') !== 'super_admin') {
            return $this->failMessage('Vous n\'avez pas accès à cette action.', 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findSchedule(string $id): ?array
    {
        if (preg_match(self::UUID, $id) !== 1) {
            return null;
        }

        $row = model(ScheduleModel::class)->find($id);

        return is_array($row) ? $row : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function input(): array
    {
        $json = $this->request->getJSON(true);
        $data = is_array($json) ? $json : [];

        $aliases = [
            'startTime'    => 'start_time',
            'endTime'      => 'end_time',
            'graceMinutes' => 'grace_minutes',
        ];

        foreach ($aliases as $from => $to) {
            if (! array_key_exists($to, $data) && array_key_exists($from, $data)) {
                $data[$to] = $data[$from];
            }
        }

        foreach (['start_time', 'end_time'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
            }
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array<string, mixed>
     */
    private function columns(array $input, bool $creating): array
    {
        $row = [];

        foreach (['start_time', 'end_time'] as $field) {
            if (! array_key_exists($field, $input) || $input[$field] === '' || $input[$field] === null) {
                continue;
            }

            $row[$field] = ScheduleModel::normalizeTime((string) $input[$field]);
        }

        if (array_key_exists('grace_minutes', $input) && $input['grace_minutes'] !== '' && $input['grace_minutes'] !== null) {
            $row['grace_minutes'] = (int) $input['grace_minutes'];
        } elseif ($creating) {
            $row['grace_minutes'] = 0;
        }

        return $row;
    }

    private function timeRangeError(string $start, string $end)
    {
        if ($this->timeToSeconds($start) >= $this->timeToSeconds($end)) {
            return $this->failMessage('L\'heure de fin doit être après l\'heure de début.', 422, [
                'end_time' => 'Doit être postérieure à l\'heure de début.',
            ]);
        }

        return null;
    }

    private function timeToSeconds(string $time): int
    {
        $parts = explode(':', $time);

        if (count($parts) < 2) {
            return 0;
        }

        $h = (int) $parts[0];
        $m = (int) $parts[1];
        $s = isset($parts[2]) ? (int) $parts[2] : 0;

        return $h * 3600 + $m * 60 + $s;
    }

    private function invalidInput()
    {
        return $this->failMessage(
            'Les informations envoyées sont incomplètes ou invalides.',
            422,
            $this->validator->getErrors(),
        );
    }

    private function notFound()
    {
        return $this->failMessage('Cet horaire est introuvable.', 404);
    }

    /**
     * @param array<string, mixed> $details
     */
    private function audit(string $action, string $scheduleId, array $details = []): void
    {
        $actor = service('auth')->currentUser();

        model(AuditLogModel::class)->record(
            is_array($actor) ? (string) $actor['id'] : null,
            'settings',
            $action,
            'schedules',
            $scheduleId,
            $details + [
                'ip'         => $this->request->getIPAddress(),
                'user_agent' => (string) $this->request->getUserAgent(),
            ],
        );
    }
}
