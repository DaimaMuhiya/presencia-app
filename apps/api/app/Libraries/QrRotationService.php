<?php

namespace App\Libraries;

use App\Models\QrTokenModel;
use App\Support\Timestamps;
use App\Support\Uuid;
use CodeIgniter\Database\BaseConnection;
use Config\Qr as QrConfig;

/**
 * Rotation des QR dynamiques : expiration temporelle et consommation au scan.
 */
class QrRotationService
{
    public function __construct(
        private ?QrTokenModel $qrTokens = null,
        private ?BaseConnection $db = null,
        private ?QrConfig $config = null,
    ) {
        $this->qrTokens ??= model(QrTokenModel::class);
        $this->db       ??= db_connect();
        $this->config   ??= config(QrConfig::class);
    }

    public function refreshSeconds(): int
    {
        return $this->config->refreshSeconds;
    }

    /**
     * @return array{rotated: bool}
     */
    public function rotateIfExpired(): array
    {
        $rotated = $this->rotateIfNeeded() !== null;

        return ['rotated' => $rotated];
    }

    /**
     * Retourne le QR affichable actuel, ou en crée un si besoin.
     *
     * @return array<string, mixed>|null
     */
    public function current(): ?array
    {
        $valid = $this->findActiveToken();
        if ($valid !== null) {
            return $this->payloadFromRow($valid);
        }

        $created = $this->rotateIfNeeded();

        return $created !== null ? $this->payloadFromRow($created) : null;
    }

    /**
     * Marque le QR comme scanné et en émet un nouveau.
     *
     * @return array{consumed: array<string, mixed>, replacement: array<string, mixed>|null}
     */
    public function consumeAndReplace(string $hashId): ?array
    {
        $hashId = trim($hashId);
        if ($hashId === '') {
            return null;
        }

        $this->db->transStart();

        $token = $this->qrTokens
            ->where('hash_id', $hashId)
            ->first();

        if ($token === null) {
            $this->db->transRollback();

            return null;
        }

        if ($token['consumed_at'] !== null) {
            $this->db->transRollback();

            return null;
        }

        if (strtotime((string) $token['expires_at']) < time()) {
            $this->db->transRollback();

            return null;
        }

        $now = Timestamps::now();
        $this->qrTokens->update($token['id'], ['consumed_at' => $now]);

        $token['consumed_at'] = $now;
        $replacement          = $this->issueNewToken();

        $this->db->transComplete();

        if (! $this->db->transStatus()) {
            return null;
        }

        return [
            'consumed'    => $this->payloadFromRow($token),
            'replacement' => $replacement !== null ? $this->payloadFromRow($replacement) : null,
        ];
    }

    /**
     * Rotation si absent, expiré ou déjà consommé.
     *
     * @return array<string, mixed>|null Nouvelle ligne créée, ou null si le QR actuel est encore valide
     */
    public function rotateIfNeeded(): ?array
    {
        $active = $this->findActiveToken();
        if ($active !== null) {
            return null;
        }

        $this->db->transStart();
        $row = $this->issueNewToken();
        $this->db->transComplete();

        return $this->db->transStatus() ? $row : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findActiveToken(): ?array
    {
        $now = Timestamps::now();

        return $this->qrTokens
            ->where('consumed_at', null)
            ->where('expires_at >', $now)
            ->orderBy('issued_at', 'DESC')
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function issueNewToken(): array
    {
        $salt    = bin2hex(random_bytes(32));
        $nonce   = bin2hex(random_bytes(16));
        $hashId  = '0x' . substr(hash('sha256', $salt . $nonce), 0, 40);
        $seconds = $this->refreshSeconds();

        $row = [
            'id'          => Uuid::v4(),
            'hash_id'     => $hashId,
            'salt'        => $salt,
            'issued_at'   => Timestamps::now(),
            'expires_at'  => Timestamps::after($seconds),
            'consumed_at' => null,
        ];

        $this->qrTokens->insert($row);

        return $row;
    }

    /**
     * @param array<string, mixed> $row
     *
     * @return array<string, mixed>
     */
    private function payloadFromRow(array $row): array
    {
        return [
            'id'                => $row['id'],
            'hash_id'           => $row['hash_id'],
            'issued_at'         => $row['issued_at'],
            'expires_at'        => $row['expires_at'],
            'consumed_at'       => $row['consumed_at'],
            'refresh_seconds'   => $this->refreshSeconds(),
        ];
    }
}
