<?php

namespace App\Controllers\Api\V1;

use App\Models\AuditLogModel;
use App\Models\ExportModel;
use Config\Validation;
use OpenApi\Spec as OA;

/**
 * Export des présences. Réservé au super_admin.
 * Le fichier n'est pas généré ici : le front reçoit les lignes en JSON.
 */
class ExportsController extends ApiController
{
    private const UUID = '/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i';

    #[OA\Operation\Get(
        path: '/api/v1/super-admin/exports',
        operationId: 'listExports',
        tags: ['Exports'],
        summary: 'Lister les demandes d\'export',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        responses: [
            new OA\Response(response: 200, description: 'Demandes enregistrées.', content: new OA\Schema(ref: '#/components/schemas/ExportListResponse')),
            new OA\Response(response: 401, description: 'Jeton invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function index()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $rows = model(ExportModel::class)
            ->orderBy('created_at', 'DESC')
            ->findAll();

        return $this->ok('Exports chargés.', [
            'exports' => array_map(ExportModel::toPublic(...), $rows),
        ]);
    }

    #[OA\Operation\Post(
        path: '/api/v1/super-admin/exports',
        operationId: 'createExport',
        tags: ['Exports'],
        summary: 'Exporter les présences d\'une période',
        description: 'Enregistre la demande (période et filtre de statut) et renvoie les lignes en JSON. Alias acceptés : startDate, endDate, statusFilter.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/ExportWriteRequest')),
        responses: [
            new OA\Response(response: 201, description: 'Lignes prêtes pour le fichier.', content: new OA\Schema(ref: '#/components/schemas/ExportDataResponse')),
            new OA\Response(response: 401, description: 'Jeton invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
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

        if (! $this->validateData($input, config(Validation::class)->exportCreate)) {
            return $this->invalidInput();
        }

        $start  = (string) $input['start_date'];
        $end    = (string) $input['end_date'];
        $status = $this->statusFilter($input);

        if ($end < $start) {
            return $this->failMessage('La date de fin doit être le même jour ou après la date de début.', 422, [
                'end_date' => 'La date de fin doit être le même jour ou après la date de début.',
            ]);
        }

        $model = model(ExportModel::class);
        $model->insert([
            'start_date'    => $start,
            'end_date'      => $end,
            'status_filter' => $status,
        ]);

        $id  = (string) $model->getInsertID();
        $row = $model->find($id);

        if (! is_array($row)) {
            return $this->failMessage('L\'export n\'a pas pu être enregistré.', 500);
        }

        $lines = $model->rowsFor($start, $end, $status);

        $actor = service('auth')->currentUser();
        model(AuditLogModel::class)->record(
            is_array($actor) ? (string) $actor['id'] : null,
            'export',
            'export_created',
            'exports',
            $id,
            [
                'start_date'    => $start,
                'end_date'      => $end,
                'status_filter' => $status,
                'row_count'     => count($lines),
            ],
        );

        return $this->ok('Export prêt.', [
            'export' => ExportModel::toPublic($row),
            'rows'   => $lines,
        ], 201);
    }

    #[OA\Operation\Get(
        path: '/api/v1/super-admin/exports/{id}',
        operationId: 'showExport',
        tags: ['Exports'],
        summary: 'Relire un export',
        description: 'Recalcule les lignes à partir de la période et du filtre enregistrés.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Path(name: 'id', required: true, schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lignes de l\'export.', content: new OA\Schema(ref: '#/components/schemas/ExportDataResponse')),
            new OA\Response(response: 401, description: 'Jeton invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 404, description: 'Export introuvable.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function show($id = null)
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $row = $this->findExport((string) $id);
        if ($row === null) {
            return $this->failMessage('Export introuvable.', 404);
        }

        $status = $row['status_filter'] !== null && $row['status_filter'] !== ''
            ? (string) $row['status_filter']
            : null;

        return $this->ok('Export chargé.', [
            'export' => ExportModel::toPublic($row),
            'rows'   => model(ExportModel::class)->rowsFor(
                (string) $row['start_date'],
                (string) $row['end_date'],
                $status,
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function input(): array
    {
        $json = $this->request->getJSON(true);
        $data = is_array($json) ? $json : [];

        $aliases = [
            'startDate'    => 'start_date',
            'endDate'      => 'end_date',
            'statusFilter' => 'status_filter',
        ];

        foreach ($aliases as $from => $to) {
            if (! array_key_exists($to, $data) && array_key_exists($from, $data)) {
                $data[$to] = $data[$from];
            }
        }

        foreach (['start_date', 'end_date', 'status_filter'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
            }
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $input
     */
    private function statusFilter(array $input): ?string
    {
        $status = $input['status_filter'] ?? null;

        if (! is_string($status) || $status === '') {
            return null;
        }

        return $status;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findExport(string $id): ?array
    {
        if (preg_match(self::UUID, $id) !== 1) {
            return null;
        }

        $row = model(ExportModel::class)->find($id);

        return is_array($row) ? $row : null;
    }

    private function denied()
    {
        $actor = service('auth')->currentUser();

        if (! is_array($actor) || ($actor['role'] ?? '') !== 'super_admin') {
            return $this->failMessage('Vous n\'avez pas accès à cette action.', 403);
        }

        return null;
    }

    private function invalidInput()
    {
        return $this->failMessage(
            'Les informations envoyées sont incomplètes ou invalides.',
            422,
            $this->validator->getErrors(),
        );
    }
}
