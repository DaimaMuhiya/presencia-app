<?php

namespace App\Libraries;

/**
 * Résultat d'une action d'authentification, prêt à devenir une réponse JSON.
 */
final class AuthResult
{
    /**
     * @param array<string, mixed>|null $data
     * @param array<string, string>     $errors
     */
    private function __construct(
        public readonly bool $ok,
        public readonly int $status,
        public readonly string $message,
        public readonly ?array $data = null,
        public readonly array $errors = [],
    ) {
    }

    /**
     * @param array<string, mixed>|null $data
     */
    public static function success(string $message, ?array $data = null, int $status = 200): self
    {
        return new self(true, $status, $message, $data);
    }

    /**
     * @param array<string, string> $errors
     */
    public static function failure(string $message, int $status = 400, array $errors = []): self
    {
        return new self(false, $status, $message, null, $errors);
    }
}
