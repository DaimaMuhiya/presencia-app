<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Modèles d'horaires de travail (planning).
 */
class CreateSchedulesTable extends Migration
{
    public function up(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query(<<<'SQL'
            CREATE TABLE schedules (
                id CHAR(36) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                grace_minutes INT NOT NULL DEFAULT 0,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);
    }

    public function down(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query('DROP TABLE IF EXISTS schedules');
    }
}
