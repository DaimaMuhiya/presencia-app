<?php

namespace App\Support;

/**
 * Identifiant unique au format UUID version 4.
 *
 * MySQL n'a pas de colonne UUID native. On génère l'identifiant en PHP
 * pour le connaître avant l'insertion, puis on le range dans un CHAR(36).
 */
final class Uuid
{
    public static function v4(): string
    {
        $bytes = random_bytes(16);

        // Les bits de version (4) et de variante (RFC 4122).
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

        $hex = bin2hex($bytes);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12),
        );
    }
}
