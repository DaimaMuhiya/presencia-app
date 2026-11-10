<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Modèle de base de l'application.
 *
 * Force le fuseau UTC sur la connexion MySQL. Sans cela, une date
 * écrite sans décalage serait lue dans le fuseau du serveur, et un jeton
 * pourrait expirer trop tôt ou trop tard.
 */
abstract class AppModel extends Model
{
    private static bool $utcReady = false;

    protected function initialize(): void
    {
        parent::initialize();

        if (self::$utcReady) {
            return;
        }

        $this->db->query("SET time_zone = '+00:00'");
        self::$utcReady = true;
    }
}
