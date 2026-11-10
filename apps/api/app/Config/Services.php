<?php

namespace Config;

use CodeIgniter\Config\BaseService;

/**
 * Services Configuration file.
 *
 * Services are simply other classes/libraries that the system uses
 * to do its job. This is used by CodeIgniter to allow the core of the
 * framework to be swapped out easily without affecting the usage within
 * the rest of your application.
 *
 * This file holds any application-specific services, or service overrides
 * that you might need. An example has been included with the general
 * method format you should use for your service methods. For more examples,
 * see the core Services file at system/Config/Services.php.
 */
use App\Libraries\AuthService;

class Services extends BaseService
{
    /**
     * Service d'authentification, partagé pendant toute la requête.
     * Le filtre et le contrôleur voient ainsi le même utilisateur connecté.
     */
    public static function auth(bool $getShared = true): AuthService
    {
        if ($getShared) {
            return static::getSharedInstance('auth');
        }

        return new AuthService();
    }
}
