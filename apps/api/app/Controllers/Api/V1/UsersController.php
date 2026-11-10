<?php

namespace App\Controllers\Api\V1;

use App\Models\AuditLogModel;
use App\Models\AuthTokenModel;
use App\Models\UserModel;
use Config\Validation;
use OpenApi\Spec as OA;
use Throwable;

/**
 * Création et gestion des comptes.
 *
 * Réservé au rôle super_admin : le groupe de routes applique
 * le filtre auth:super_admin. Le mot de passe n'est jamais renvoyé.
 */
class UsersController extends ApiController
{
    private const UUID = '/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i';

    #[OA\Operation\Get(
        path: '/api/v1/super-admin/users',
        operationId: 'listUsers',
        tags: ['Comptes'],
        summary: 'Lister les comptes',
        description: 'Réservé au super administrateur. Les comptes supprimés sont absents.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        responses: [
            new OA\Response(response: 200, description: 'Liste des comptes.', content: new OA\Schema(ref: '#/components/schemas/UserListResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function index()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $rows = model(UserModel::class)
            ->orderBy('last_name', 'ASC')
            ->orderBy('first_name', 'ASC')
            ->findAll();

        return $this->ok('Comptes chargés.', [
            'users' => array_map(UserModel::toPublic(...), $rows),
        ]);
    }

    #[OA\Operation\Get(
        path: '/api/v1/super-admin/users/{id}',
        operationId: 'showUser',
        tags: ['Comptes'],
        summary: 'Afficher un compte',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Path(name: 'id', description: 'Identifiant du compte.', schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Compte trouvé.', content: new OA\Schema(ref: '#/components/schemas/UserItemResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 404, description: 'Compte introuvable.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function show($id = null)
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $user = $this->findUser((string) $id);

        if ($user === null) {
            return $this->notFound();
        }

        return $this->ok('Compte chargé.', [
            'user' => UserModel::toPublic($user),
        ]);
    }

    #[OA\Operation\Post(
        path: '/api/v1/super-admin/users',
        operationId: 'createUser',
        tags: ['Comptes'],
        summary: 'Créer un compte',
        description: 'Le matricule et le mot de passe sont produits par l\'API. Le mot de passe est haché, puis envoyé à work_email. Il n\'est jamais renvoyé dans la réponse. Alias acceptés : firstName, lastName, workEmail, email, jobTitle, position, employmentStatus, workStatus, joiningDate, avatar, avatarUrl, pushEnabled, emailEnabled.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/UserCreateRequest')),
        responses: [
            new OA\Response(response: 201, description: 'Compte créé.', content: new OA\Schema(ref: '#/components/schemas/UserItemResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le rôle n\'est pas super_admin.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 502, description: 'Le mot de passe n\'a pas pu être envoyé. Le compte n\'est pas conservé.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function create()
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->userCreate)) {
            return $this->invalidInput();
        }

        $row = $this->columns($input, true);
        $password = $this->generatedPassword();
        $row['employee_code'] = $this->nextEmployeeCode((string) $row['role']);
        $row['password_hash'] = UserModel::hashPassword($password);

        $users = model(UserModel::class);

        if ($users->insert($row) === false) {
            return $this->failMessage('Le compte n\'a pas pu être créé.', 500);
        }

        $created = $users->findByEmail((string) $row['work_email']);

        if ($created === null) {
            return $this->failMessage('Le compte n\'a pas pu être créé.', 500);
        }

        $sent = $this->sendInitialPassword(
            (string) $created['work_email'],
            (string) $created['first_name'],
            $password,
        );

        // En développement, le mot de passe est aussi écrit dans le journal,
        // comme les codes de connexion. Il n'est jamais renvoyé dans l'API.
        if (ENVIRONMENT === 'development') {
            log_message('notice', 'Mot de passe initial pour {email} : {password}', [
                'email'    => $created['work_email'],
                'password' => $password,
            ]);
        }

        if (! $sent && ENVIRONMENT !== 'development') {
            $users->delete($created['id'], true);

            return $this->failMessage(
                'Le compte n\'a pas été créé : l\'email contenant le mot de passe n\'a pas pu être envoyé.',
                502,
            );
        }

        $this->audit('user_created', (string) $created['id'], [
            'role'          => $created['role'],
            'employee_code' => $created['employee_code'],
        ]);

        $message = $sent
            ? 'Compte créé. Le mot de passe a été envoyé par email.'
            : 'Compte créé. L\'email n\'a pas pu être envoyé.';

        return $this->ok($message, [
            'user' => UserModel::toPublic($created),
        ], 201);
    }

    #[OA\Operation\Put(
        path: '/api/v1/super-admin/users/{id}',
        operationId: 'updateUser',
        tags: ['Comptes'],
        summary: 'Modifier un compte',
        description: 'Seuls les champs envoyés sont modifiés. Un nouveau mot de passe, ou un statut autre qu\'actif, ferme les sessions de ce compte. Le dernier super administrateur actif ne peut pas être rétrogradé ni désactivé.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Path(name: 'id', description: 'Identifiant du compte.', schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\Schema(ref: '#/components/schemas/UserUpdateRequest')),
        responses: [
            new OA\Response(response: 200, description: 'Compte modifié.', content: new OA\Schema(ref: '#/components/schemas/UserItemResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Action interdite pour ce compte.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 404, description: 'Compte introuvable.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Saisie invalide, ou mots de passe différents.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    
    public function update($id = null)
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $id   = (string) $id;
        $user = $this->findUser($id);

        if ($user === null) {
            return $this->notFound();
        }

        $input = $this->input();
        $rules = array_intersect_key(config(Validation::class)->userUpdate($id), $input);

        if ($rules === [] || ! $this->validateData($input, $rules)) {
            return $rules === []
                ? $this->failMessage('Aucune modification à enregistrer.', 422)
                : $this->invalidInput();
        }

        if (! $this->passwordsMatch($input)) {
            return $this->passwordMismatch();
        }

        $changes = $this->columns($input, false);

        if ($changes === []) {
            return $this->failMessage('Aucune modification à enregistrer.', 422);
        }

        if ($this->removesLastSuperAdmin($user, $changes, false)) {
            return $this->failMessage('Il doit rester au moins un super administrateur actif.', 403);
        }

        $users = model(UserModel::class);

        if ($users->update($id, $changes) === false) {
            return $this->failMessage('Le compte n\'a pas pu être modifié.', 500);
        }

        $passwordChanged = isset($changes['password_hash']);
        $deactivated = isset($changes['employment_status']) && $changes['employment_status'] !== 'active';

        if ($passwordChanged || $deactivated) {
            model(AuthTokenModel::class)->revokeAllForUser($id);
        }

        $updated = $users->find($id);

        $this->audit('user_updated', $id, [
            'fields' => array_keys($changes),
        ]);

        return $this->ok('Compte modifié.', [
            'user' => UserModel::toPublic(is_array($updated) ? $updated : $user),
        ]);
    }

    #[OA\Operation\Delete(
        path: '/api/v1/super-admin/users/{id}',
        operationId: 'deleteUser',
        tags: ['Comptes'],
        summary: 'Supprimer un compte',
        description: 'Suppression logique. Les sessions du compte sont fermées. Un super administrateur ne peut pas supprimer son propre compte, ni le dernier super administrateur actif.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        parameters: [
            new OA\Parameter\Path(name: 'id', description: 'Identifiant du compte.', schema: new OA\Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Compte supprimé.', content: new OA\Schema(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Action interdite pour ce compte.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 404, description: 'Compte introuvable.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function delete($id = null)
    {
        if ($denied = $this->denied()) {
            return $denied;
        }

        $id = (string) $id;
        $user = $this->findUser($id);

        if ($user === null) {
            return $this->notFound();
        }

        $actor = service('auth')->currentUser();

        if (is_array($actor) && (string) $actor['id'] === (string) $user['id']) {
            return $this->failMessage('Vous ne pouvez pas supprimer votre propre compte.', 403);
        }

        if ($this->removesLastSuperAdmin($user, [], true)) {
            return $this->failMessage('Il doit rester au moins un super administrateur actif.', 403);
        }

        model(AuthTokenModel::class)->revokeAllForUser($id);
        model(UserModel::class)->delete($id);

        $this->audit('user_deleted', $id);

        return $this->ok('Compte supprimé.');
    }

    /**
     * Génère un mot de passe aléatoire.
     *
     * @return string
     */
    private function generatePassword()
    {
        //
    }

    /**
     * Le filtre de route porte déjà le rôle. Ce contrôle évite qu'une
     * route oubliée sans filtre ouvre quand même ces actions.
     */
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
    private function findUser(string $id): ?array
    {
        if (preg_match(self::UUID, $id) !== 1) {
            return null;
        }

        $user = model(UserModel::class)->find($id);

        return is_array($user) ? $user : null;
    }

    /**
     * @param array<string, mixed> $user
     * @param array<string, mixed> $changes
     */
    private function removesLastSuperAdmin(array $user, array $changes, bool $deleting): bool
    {
        if (($user['role'] ?? '') !== 'super_admin' || ($user['employment_status'] ?? '') !== 'active') {
            return false;
        }

        $nextRole = array_key_exists('role', $changes) ? (string) $changes['role'] : null;
        $nextStatus = array_key_exists('employment_status', $changes) ? (string) $changes['employment_status'] : null;
        $stays = ! $deleting
            && ($nextRole === null || $nextRole === 'super_admin')
            && ($nextStatus === null || $nextStatus === 'active');

        if ($stays) {
            return false;
        }

        return model(UserModel::class)
            ->where('role', 'super_admin')
            ->where('employment_status', 'active')
            ->where('id !=', $user['id'])
            ->countAllResults() === 0;
    }

    /**
     * @return array<string, mixed>
     */
    private function input(): array
    {
        $json = $this->request->getJSON(true);
        $data = is_array($json) ? $json : [];

        $aliases = [
            'firstName'            => 'first_name',
            'lastName'             => 'last_name',
            'workEmail'            => 'work_email',
            'email'                => 'work_email',
            'employeeCode'         => 'employee_code',
            'employeeId'           => 'employee_code',
            'jobTitle'             => 'job_title',
            'position'             => 'job_title',
            'employmentStatus'     => 'employment_status',
            'workStatus'           => 'employment_status',
            'joiningDate'          => 'joining_date',
            'avatarUrl'            => 'avatar_url',
            'avatar'               => 'avatar_url',
            'pushEnabled'          => 'push_enabled',
            'emailEnabled'         => 'email_enabled',
            'passwordConfirmation' => 'password_confirmation',
        ];

        foreach ($aliases as $from => $to) {
            if (! array_key_exists($to, $data) && array_key_exists($from, $data)) {
                $data[$to] = $data[$from];
            }
        }

        if (isset($data['work_email'])) {
            $data['work_email'] = mb_strtolower(trim((string) $data['work_email']));
        }

        foreach (['first_name', 'last_name', 'phone', 'job_title', 'avatar_url', 'employee_code'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = trim($data[$field]);
            }
        }

        foreach (['push_enabled', 'email_enabled'] as $flag) {
            if (! array_key_exists($flag, $data) || $data[$flag] === '' || $data[$flag] === null) {
                continue;
            }

            $parsed = filter_var($data[$flag], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

            if ($parsed !== null) {
                $data[$flag] = $parsed ? '1' : '0';
            }
        }

        return $data;
    }

    /**
     * Colonnes autorisées, prêtes pour le modèle.
     * Le mot de passe en clair n'en fait pas partie.
     *
     * @param array<string, mixed> $input
     *
     * @return array<string, mixed>
     */
    private function columns(array $input, bool $creating): array
    {
        $row = [];

        foreach (['first_name', 'last_name', 'work_email', 'phone', 'role', 'employment_status', 'job_title', 'joining_date', 'avatar_url'] as $field) {
            if (! array_key_exists($field, $input)) {
                continue;
            }

            $value = $input[$field];
            $row[$field] = is_string($value) && $value === '' ? null : $value;
        }

        foreach (['push_enabled', 'email_enabled'] as $flag) {
            if (array_key_exists($flag, $input) && ($input[$flag] === '0' || $input[$flag] === '1')) {
                $row[$flag] = (int) $input[$flag];
            }
        }

        if (! $creating && isset($input['password']) && (string) $input['password'] !== '') {
            $row['password_hash'] = UserModel::hashPassword((string) $input['password']);
        }

        if ($creating) {
            $row['role'] = $row['role'] ?? 'employee';
            $row['employment_status'] = $row['employment_status'] ?? 'active';
            $row['push_enabled'] ??= 1;
            $row['email_enabled'] ??= 1;

            return $row;
        }

        foreach (['first_name', 'last_name', 'work_email', 'role', 'employment_status'] as $required) {
            if (array_key_exists($required, $row) && ($row[$required] === null || $row[$required] === '')) {
                unset($row[$required]);
            }
        }

        return $row;
    }

    /**
     * @param array<string, mixed> $input
     */
    private function passwordsMatch(array $input): bool
    {
        if (! isset($input['password_confirmation'])) {
            return true;
        }

        return (string) $input['password_confirmation'] === (string) ($input['password'] ?? '');
    }

    private function passwordMismatch()
    {
        return $this->failMessage('Les deux mots de passe ne correspondent pas.', 422, [
            'password_confirmation' => 'Les deux mots de passe ne correspondent pas.',
        ]);
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
        return $this->failMessage('Ce compte est introuvable.', 404);
    }

    /**
     * @param array<string, mixed> $details
     */
    private function audit(string $action, string $userId, array $details = []): void
    {
        $actor = service('auth')->currentUser();

        model(AuditLogModel::class)->record(
            is_array($actor) ? (string) $actor['id'] : null,
            'users',
            $action,
            'users',
            $userId,
            $details + [
                'ip'         => $this->request->getIPAddress(),
                'user_agent' => (string) $this->request->getUserAgent(),
            ],
        );
    }

    /**
     * Mot de passe initial, lisible dans un email, jamais renvoyé par l'API.
     */
    private function generatedPassword(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        $length   = strlen($alphabet);
        $password = '';

        for ($i = 0; $i < 12; $i++) {
            $password .= $alphabet[random_int(0, $length - 1)];
        }

        return $password;
    }

    /**
     * Matricule unique : SA pour un super administrateur, AD pour un admin, EM pour un employé.
     * Les comptes supprimés comptent encore, le matricule reste unique en base.
     */
    private function nextEmployeeCode(string $role): string
    {
        $prefix = match ($role) {
            'super_admin' => 'SA',
            'admin'       => 'AD',
            default       => 'EM',
        };

        $rows = model(UserModel::class)
            ->withDeleted()
            ->like('employee_code', $prefix . '-', 'after')
            ->findAll();

        $max = 0;

        foreach ($rows as $row) {
            if (preg_match('/\A' . $prefix . '-(\d+)\z/', (string) ($row['employee_code'] ?? ''), $matches) === 1) {
                $max = max($max, (int) $matches[1]);
            }
        }

        return sprintf('%s-%05d', $prefix, $max + 1);
    }

    private function sendInitialPassword(string $email, string $firstName, string $password): bool
    {
        return $this->sendMail(
            $email,
            'Votre accès Presencia',
            view('emails/account_created', [
                'firstName' => $firstName,
                'email'     => $email,
                'password'  => $password,
            ]),
        );
    }

    private function sendMail(string $to, string $subject, string $message): bool
    {
        $config = config(\Config\Email::class);

        if ($config->SMTPUser === '' || $config->SMTPPass === '' || $config->fromEmail === '') {
            log_message('error', 'Email non envoyé : BREVO_SMTP_USER, BREVO_SMTP_KEY ou BREVO_FROM_EMAIL est vide.');

            return false;
        }

        try {
            $mail = service('email');
            $mail->clear(true);
            $mail->setTo($to);
            $mail->setSubject($subject);
            $mail->setMessage($message);

            if (! $mail->send(false)) {
                log_message('error', 'Le serveur SMTP a refusé l\'email vers {to}.', ['to' => $to]);

                return false;
            }
        } catch (Throwable $exception) {
            log_message('error', 'Envoi de l\'email impossible : {message}', [
                'message' => $exception->getMessage(),
            ]);

            return false;
        }

        return true;
    }
}
