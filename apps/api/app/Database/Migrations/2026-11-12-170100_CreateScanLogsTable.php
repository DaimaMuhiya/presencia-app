<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateScanLogsTable extends Migration
{
    public function up(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query(<<<'SQL'
            CREATE TABLE scan_logs (
                id CHAR(36) NOT NULL,
                attendance_id CHAR(36) NULL,
                user_id CHAR(36) NOT NULL,
                qr_token_id CHAR(36) NULL,
                method ENUM('qr_scan', 'manual_code', 'biometric', 'admin_entry') NOT NULL DEFAULT 'qr_scan',
                scanned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                is_success TINYINT(1) NOT NULL DEFAULT 1,
                failure_reason VARCHAR(255) NULL,
                PRIMARY KEY (id),
                KEY scan_logs_user_scanned (user_id, scanned_at),
                KEY scan_logs_scanned_at (scanned_at),
                CONSTRAINT fk_scan_logs_user
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                CONSTRAINT fk_scan_logs_attendance
                    FOREIGN KEY (attendance_id) REFERENCES attendances (id) ON DELETE SET NULL,
                CONSTRAINT fk_scan_logs_qr
                    FOREIGN KEY (qr_token_id) REFERENCES qr_tokens (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);
    }

    public function down(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query('DROP TABLE IF EXISTS scan_logs');
    }
}
