<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateExportsTable extends Migration
{
    public function up(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query(<<<'SQL'
            CREATE TABLE exports (
                id CHAR(36) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status_filter ENUM('on_time', 'late', 'absent', 'exception') NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY exports_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);
    }

    public function down(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query('DROP TABLE IF EXISTS exports');
    }
}
