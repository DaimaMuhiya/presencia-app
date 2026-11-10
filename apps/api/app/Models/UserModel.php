<?php

namespace App\Models;

use App\Support\Uuid;

/**
 * Comptes de l'application : employés, admins RH et super admins.
 *
 * Le mot de passe n'est jamais enregistré en clair. La colonne
 * password_hash reçoit déjà le résultat de hashPassword().
 */
class UserModel extends AppModel
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'employee_code',
        'first_name',
        'last_name',
        'work_email',
        'phone',
        'password_hash',
        'avatar_url',
        'role',
        'employment_status',
        'job_title',
        'joining_date',
        'push_enabled',
        'email_enabled',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $beforeInsert = ['assignId'];

    /**
     * Hache un mot de passe avec l'algorithme recommandé par PHP
     * (bcrypt ou Argon2, selon la version). C'est le même principe
     * que celui utilisé par le composant officiel CodeIgniter Shield.
     */
    public static function hashPassword(string $plain): string
    {
        return password_hash($plain, PASSWORD_DEFAULT);
    }

    /**
     * Vérifie un mot de passe saisi contre l'empreinte stockée.
     * La comparaison est faite de façon sûre par PHP.
     */
    public static function verifyPassword(string $plain, string $hash): bool
    {
        return password_verify($plain, $hash);
    }

    /**
     * Empreinte factice, utilisée quand l'email n'existe pas.
     *
     * On vérifie quand même un mot de passe, pour que la réponse prenne
     * à peu près le même temps que pour un vrai compte. Cela évite de
     * révéler si l'email est connu.
     */
    public static function dummyHash(): string
    {
        static $hash = null;

        if ($hash === null) {
            $hash = password_hash('not-a-real-password', PASSWORD_DEFAULT);
        }

        return $hash;
    }

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
     * Cherche un compte par son email professionnel.
     * Les comptes supprimés (deleted_at) sont ignorés par le modèle.
     *
     * @return array<string, mixed>|null
     */
    public function findByEmail(string $email): ?array
    {
        $row = $this->where('work_email', mb_strtolower(trim($email)))->first();

        return is_array($row) ? $row : null;
    }

    /**
     * Forme publique d'un utilisateur.
     * Le mot de passe haché n'en fait jamais partie.
     *
     * Les noms en camelCase (employeeId, workStatus...) reprennent
     * les champs déjà attendus par l'application web.
     *
     * @param array<string, mixed> $user
     *
     * @return array<string, mixed>
     */
    public static function toPublic(array $user): array
    {
        $firstName = (string) ($user['first_name'] ?? '');
        $lastName  = (string) ($user['last_name'] ?? '');

        return [
            'id'                => $user['id'],
            'email'             => $user['work_email'],
            'work_email'        => $user['work_email'],
            'firstName'         => $firstName,
            'lastName'          => $lastName,
            'first_name'        => $firstName,
            'last_name'         => $lastName,
            'name'              => trim($firstName . ' ' . $lastName),
            'employeeId'        => $user['employee_code'],
            'employee_code'     => $user['employee_code'],
            'position'          => $user['job_title'],
            'job_title'         => $user['job_title'],
            'role'              => $user['role'],
            'workStatus'        => $user['employment_status'],
            'employment_status' => $user['employment_status'],
            'joiningDate'       => $user['joining_date'],
            'joining_date'      => $user['joining_date'],
            'avatar'            => $user['avatar_url'],
            'avatar_url'        => $user['avatar_url'],
            'phone'             => $user['phone'],
        ];
    }
}
