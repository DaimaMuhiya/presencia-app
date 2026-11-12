<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAttendancesTable extends Migration
{
    public function up(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query(<<<'SQL'
            CREATE TABLE attendances (
                id CHAR(36) NOT NULL,
                user_id CHAR(36) NOT NULL,
                schedules_id CHAR(36) NULL,
                attendance_date DATE NOT NULL,
                arrival_at DATETIME NULL,
                departure_at DATETIME NULL,
                status ENUM('on_time', 'late', 'absent', 'exception') NOT NULL DEFAULT 'on_time',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY attendances_user_date (user_id, attendance_date),
                KEY attendances_date (attendance_date),
                KEY attendances_status (status),
                CONSTRAINT fk_attendances_user
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                CONSTRAINT fk_attendances_schedule
                    FOREIGN KEY (schedules_id) REFERENCES schedules (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);
    }

    public function down(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query('DROP TABLE IF EXISTS attendances');
    }
}
