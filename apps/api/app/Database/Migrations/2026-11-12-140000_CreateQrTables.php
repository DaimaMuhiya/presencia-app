<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Jetons QR dynamiques (historique + code courant).
 */
class CreateQrTables extends Migration
{
    public function up(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query(<<<'SQL'
            CREATE TABLE qr_tokens (
                id CHAR(36) NOT NULL,
                hash_id VARCHAR(100) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                consumed_at DATETIME NULL,
                PRIMARY KEY (id),
                UNIQUE KEY qr_tokens_hash_id (hash_id),
                KEY qr_tokens_active (consumed_at, expires_at),
                KEY qr_tokens_issued_at (issued_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL);
    }

    public function down(): void
    {
        if ($this->db->DBDriver !== 'MySQLi') {
            return;
        }

        $this->db->query('DROP TABLE IF EXISTS qr_tokens');
    }
}
