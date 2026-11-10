<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Tables nécessaires à l'authentification, d'après le schéma Presencia.
 *
 * Les valeurs autorisées sont des colonnes ENUM MySQL. Les identifiants
 * sont des chaînes de 36 caractères, générées par l'application avant l'insertion.
 *
 * Deux écarts, volontaires, par rapport au fichier DBML :
 * - token_type gagne la valeur « access ». Le schéma ne prévoyait que
 *   le renouvellement et la réinitialisation. L'API a aussi besoin d'un
 *   jeton court, révocable, envoyé à chaque requête.
 * - la table auth_tokens n'était pas dessinée, alors que l'énumération
 *   token_type existait. C'est elle qui range ces jetons.
 *
 * L'index department_id indiqué sur users n'est pas créé : la colonne
 * n'existe pas dans le schéma simplifié.
 */
class CreateAuthTables extends Migration
{
    public function up(): void
    {
        // Les tests automatiques utilisent SQLite. Ces tables sont prévues pour MySQL.
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query(<<<'SQL'
            CREATE TABLE users (
                id CHAR(36) NOT NULL,
                employee_code VARCHAR(30) NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                work_email VARCHAR(150) NOT NULL,
                phone VARCHAR(30) NULL,
                password_hash VARCHAR(255) NOT NULL,
                avatar_url TEXT NULL,
                role ENUM('super_admin', 'admin', 'employee') NOT NULL DEFAULT 'employee',
                employment_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
                job_title VARCHAR(100) NULL,
                joining_date DATE NULL,
                push_enabled TINYINT(1) NOT NULL DEFAULT 1,
                email_enabled TINYINT(1) NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at DATETIME NULL,
                PRIMARY KEY (id),
                UNIQUE KEY users_employee_code (employee_code),
                UNIQUE KEY users_work_email (work_email),
                KEY users_employment_status (employment_status),
                KEY users_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);

        $this->db->query(<<<'SQL'
            CREATE TABLE auth_tokens (
                id CHAR(36) NOT NULL,
                user_id CHAR(36) NOT NULL,
                type ENUM('access', 'refresh', 'password_reset') NOT NULL,
                token_hash VARCHAR(64) NOT NULL,
                expires_at DATETIME NOT NULL,
                used_at DATETIME NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY auth_tokens_hash (token_hash),
                KEY auth_tokens_user_type (user_id, type),
                CONSTRAINT fk_auth_tokens_user
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);

        $this->db->query(<<<'SQL'
            CREATE TABLE access_requests (
                id CHAR(36) NOT NULL,
                full_name VARCHAR(200) NOT NULL,
                work_email VARCHAR(150) NOT NULL,
                message TEXT NULL,
                status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
                reviewed_by CHAR(36) NULL,
                reviewed_at DATETIME NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY access_requests_email_status (work_email, status),
                CONSTRAINT fk_access_requests_reviewer
                    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);

        $this->db->query(<<<'SQL'
            CREATE TABLE audit_logs (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id CHAR(36) NULL,
                category ENUM('auth', 'attendance', 'qr', 'settings', 'export', 'api', 'employee') NOT NULL,
                action VARCHAR(100) NOT NULL,
                entity VARCHAR(100) NULL,
                entity_id VARCHAR(64) NULL,
                details JSON NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY audit_logs_category_created (category, created_at),
                KEY audit_logs_user (user_id),
                CONSTRAINT fk_audit_logs_user
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);
    }

    public function down(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query('DROP TABLE IF EXISTS audit_logs');
        $this->db->query('DROP TABLE IF EXISTS access_requests');
        $this->db->query('DROP TABLE IF EXISTS auth_tokens');
        $this->db->query('DROP TABLE IF EXISTS users');
    }
}
