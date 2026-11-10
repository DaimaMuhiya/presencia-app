<?php

namespace App\Database\Seeds;

use App\Models\UserModel;
use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Comptes de développement.
 *
 * Le mot de passe n'est pas écrit dans le code : il est lu dans
 * auth.seedPassword du fichier .env. Ne lancez pas ce seeder en production.
 *
 *   php spark db:seed AuthSeeder
 */
class AuthSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('auth.seedPassword');

        if (! is_string($password) || $password === '') {
            throw new RuntimeException(
                'Définissez auth.seedPassword dans le fichier .env avant de lancer ce seeder.',
            );
        }

        $users = model(UserModel::class);
        $hash  = UserModel::hashPassword($password);

        $accounts = [
            [
                'employee_code' => 'SA-00001',
                'first_name'    => 'Admin',
                'last_name'     => 'Presencia',
                'work_email'    => 'admin@ikwook.cd',
                'role'          => 'super_admin',
                'job_title'     => 'Administrateur système',
            ],
            [
                'employee_code' => 'EM-00001',
                'first_name'    => 'Employe',
                'last_name'     => 'Presencia',
                'work_email'    => 'employe@ikwook.cd',
                'role'          => 'employee',
                'job_title'     => 'Employé',
            ],
        ];

        foreach ($accounts as $account) {
            if ($users->findByEmail($account['work_email']) !== null) {
                continue;
            }

            $users->insert($account + [
                'password_hash'     => $hash,
                'employment_status' => 'active',
                'joining_date'      => date('Y-m-d'),
            ]);
        }
    }
}
