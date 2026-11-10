<?php

namespace App\Support;

use CodeIgniter\I18n\Time;

/**
 * Dates enregistrées en UTC, au format attendu par une colonne DATETIME MySQL.
 *
 * La session MySQL est aussi réglée sur UTC, donc NOW() et ces dates
 * se comparent dans le même fuseau.
 */
final class Timestamps
{
    public static function now(): string
    {
        return Time::now('UTC')->format('Y-m-d H:i:s');
    }

    public static function after(int $seconds): string
    {
        return Time::now('UTC')->addSeconds($seconds)->format('Y-m-d H:i:s');
    }
}
