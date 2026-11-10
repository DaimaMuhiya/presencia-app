<?php

namespace App\Libraries;

/**
 * Empreinte des jetons secrets.
 *
 * On ne stocke jamais le jeton en clair. On stocke son empreinte SHA-256,
 * comme on stocke un mot de passe haché. Le jeton en clair n'est renvoyé
 * qu'une seule fois, au moment où on le crée.
 */
final class TokenHash
{
    /**
     * Empreinte d'un jeton long (accès ou renouvellement).
     * Le jeton est déjà imprévisible, l'empreinte sert surtout à ne pas
     * le laisser lisible dans la base.
     */
    public static function forSecret(string $secret): string
    {
        return hash('sha256', $secret);
    }

    /**
     * Empreinte d'un code de réinitialisation à 6 chiffres.
     *
     * Le code est court. On y mélange l'email pour que deux personnes
     * qui recevraient le même code n'aient pas la même empreinte.
     */
    public static function forResetCode(string $email, string $code): string
    {
        $email = mb_strtolower(trim($email));

        return hash('sha256', $email . '|' . $code);
    }
}
