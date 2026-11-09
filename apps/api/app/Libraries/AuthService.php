<?php

namespace App\Libraries;

use App\Models\AccessRequestModel;
use App\Models\AuditLogModel;
use App\Models\AuthTokenModel;
use App\Models\UserModel;
use App\Support\Timestamps;
use Config\Auth;
use Throwable;

/**
 * Authentification de l'API.
 *
 * CodeIgniter 4 ne livre pas de comptes utilisateurs tout faits.
 * Il fournit en revanche les briques utilisées ici :
 * - password_hash / password_verify pour les mots de passe
 * - le service Throttler pour limiter les essais
 * - la bibliothèque Email pour le code de réinitialisation
 * - les modèles, la validation et les filtres autour de cette classe
 *
 * Un jeton d'accès dure peu de temps. Le jeton de renouvellement
 * permet d'en obtenir un nouveau sans redemander le mot de passe.
 * Les deux ne sont stockés que sous forme d'empreinte.
 */
class AuthService
{
    private UserModel $users;
    private AuthTokenModel $tokens;
    private AccessRequestModel $accessRequests;
    private AuditLogModel $audit;

    /** @var array<string, mixed>|null */
    private ?array $currentUser = null;

    public function __construct()
    {
        $this->users          = model(UserModel::class);
        $this->tokens         = model(AuthTokenModel::class);
        $this->accessRequests = model(AccessRequestModel::class);
        $this->audit          = model(AuditLogModel::class);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function currentUser(): ?array
    {
        return $this->currentUser;
    }

    /**
     * Retrouve la personne à partir du jeton d'accès (en-tête Bearer).
     * Mémorise le résultat pour le reste de la requête.
     *
     * @return array<string, mixed>|null
     */
    public function userFromAccessToken(string $rawToken): ?array
    {
        $row = $this->tokens->findActiveByHash(TokenHash::forSecret($rawToken), 'access');

        if ($row === null) {
            return null;
        }

        $user = $this->users->find($row['user_id']);

        if (! is_array($user) || ($user['employment_status'] ?? '') !== 'active') {
            return null;
        }

        $this->currentUser = $user;

        return $user;
    }

    public function login(
        string $email,
        string $password,
        bool $remember,
        string $ip,
        string $userAgent,
    ): AuthResult {
        $email = $this->normalizeEmail($email);

        if (! $this->allowAttempt('login', $ip, $email, $this->config()->loginAttempts, $this->config()->loginWindow)) {
            return AuthResult::failure(
                'Trop de tentatives. Réessayez dans quelques minutes.',
                429,
            );
        }

        $user        = $this->users->findByEmail($email);
        $hash        = is_array($user) ? (string) $user['password_hash'] : UserModel::dummyHash();
        $passwordOk  = UserModel::verifyPassword($password, $hash);

        if (! is_array($user) || ! $passwordOk) {
            $this->audit->record(
                is_array($user) ? (string) $user['id'] : null,
                'auth',
                'login_failed',
                'users',
                is_array($user) ? (string) $user['id'] : null,
                ['ip' => $ip, 'user_agent' => $userAgent],
            );

            return AuthResult::failure('Email ou mot de passe incorrect.', 401);
        }

        if ($user['employment_status'] !== 'active') {
            $message = $user['employment_status'] === 'suspended'
                ? 'Ce compte est suspendu. Contactez un administrateur.'
                : 'Ce compte n\'est plus actif.';

            return AuthResult::failure($message, 403);
        }

        $session = $this->issueSession((string) $user['id'], $remember);

        $this->audit->record((string) $user['id'], 'auth', 'login', 'users', (string) $user['id'], [
            'ip'       => $ip,
            'user_agent' => $userAgent,
            'remember' => $remember,
        ]);

        return AuthResult::success('Connexion réussie.', [
            'user'         => UserModel::toPublic($user),
            'token'        => $session['access'],
            'refreshToken' => $session['refresh'],
            'expiresIn'    => $this->config()->accessTokenTtl,
        ]);
    }

    /**
     * Échange un jeton de renouvellement contre une nouvelle paire de jetons.
     * L'ancien jeton de renouvellement est marqué utilisé : on ne peut pas
     * s'en resservir. S'il réapparaît, toutes les sessions de la personne
     * sont fermées.
     */
    public function refresh(string $refreshToken, string $ip, string $userAgent): AuthResult
    {
        $hash = TokenHash::forSecret($refreshToken);
        $row  = $this->tokens->findByHash($hash, 'refresh');

        if ($row === null) {
            return AuthResult::failure('Session invalide. Reconnectez-vous.', 401);
        }

        if ($row['used_at'] !== null) {
            $this->tokens->revokeAllForUser((string) $row['user_id']);
            $this->audit->record((string) $row['user_id'], 'auth', 'refresh_reused', 'users', (string) $row['user_id'], [
                'ip' => $ip,
                'user_agent' => $userAgent,
            ]);

            return AuthResult::failure('Session invalide. Reconnectez-vous.', 401);
        }

        $active = $this->tokens->findActiveByHash($hash, 'refresh');

        if ($active === null) {
            return AuthResult::failure('Session expirée. Reconnectez-vous.', 401);
        }

        $user = $this->users->find($active['user_id']);

        if (! is_array($user) || $user['employment_status'] !== 'active') {
            $this->tokens->revoke((string) $active['id']);

            return AuthResult::failure('Ce compte ne peut plus se connecter.', 403);
        }

        $this->tokens->revoke((string) $active['id']);

        // « Garder ma session » allonge seulement le prochain renouvellement
        // si l'ancien jeton durait déjà plus que la durée courte.
        $remember = $this->tokenLooksRemembered($active);
        $session  = $this->issueSession((string) $user['id'], $remember);

        return AuthResult::success('Session renouvelée.', [
            'user'         => UserModel::toPublic($user),
            'token'        => $session['access'],
            'refreshToken' => $session['refresh'],
            'expiresIn'    => $this->config()->accessTokenTtl,
        ]);
    }

    /**
     * Ferme la session présentée. La réponse reste un succès même si le
     * jeton est déjà périmé : l'application peut toujours oublier la session.
     */
    public function logout(?string $accessToken, ?string $refreshToken, string $ip, string $userAgent): AuthResult
    {
        $userId = null;

        if ($accessToken !== null && $accessToken !== '') {
            $access = $this->tokens->findByHash(TokenHash::forSecret($accessToken), 'access');
            if ($access !== null && $access['used_at'] === null) {
                $this->tokens->revoke((string) $access['id']);
                $userId = (string) $access['user_id'];
            }
        }

        if ($refreshToken !== null && $refreshToken !== '') {
            $refresh = $this->tokens->findByHash(TokenHash::forSecret($refreshToken), 'refresh');
            if ($refresh !== null && $refresh['used_at'] === null) {
                $this->tokens->revoke((string) $refresh['id']);
                $userId = (string) $refresh['user_id'];
            }
        }

        if ($userId !== null) {
            $this->audit->record($userId, 'auth', 'logout', 'users', $userId, [
                'ip' => $ip,
                'user_agent' => $userAgent,
            ]);
        }

        return AuthResult::success('Déconnexion réussie.');
    }

    /**
     * Envoie un code à 6 chiffres. La réponse est la même que l'email
     * existe ou non, pour ne pas indiquer quels comptes sont enregistrés.
     */
    public function forgotPassword(string $email, string $ip, string $userAgent): AuthResult
    {
        $email   = $this->normalizeEmail($email);
        $message = 'Si un compte correspond à cet email, un code de réinitialisation a été envoyé.';

        if (! $this->allowAttempt('reset', $ip, $email, $this->config()->resetAttempts, $this->config()->resetWindow)) {
            return AuthResult::failure(
                'Trop de demandes. Réessayez plus tard.',
                429,
            );
        }

        $user = $this->users->findByEmail($email);

        if (! is_array($user) || $user['employment_status'] !== 'active') {
            return AuthResult::success($message);
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Un seul code en attente par personne.
        $this->tokens->builder()
            ->where('user_id', $user['id'])
            ->where('type', 'password_reset')
            ->where('used_at', null)
            ->update(['used_at' => Timestamps::now()]);

        $this->tokens->insert([
            'user_id'    => $user['id'],
            'type'       => 'password_reset',
            'token_hash' => TokenHash::forResetCode($email, $code),
            'expires_at' => Timestamps::after($this->config()->passwordResetTtl),
        ]);

        $this->sendResetCode($email, (string) $user['first_name'], $code);

        $this->audit->record((string) $user['id'], 'auth', 'password_reset_requested', 'users', (string) $user['id'], [
            'ip' => $ip,
            'user_agent' => $userAgent,
        ]);

        return AuthResult::success($message);
    }

    /**
     * Vérifie le code sans le consommer.
     * L'écran peut ainsi passer à la saisie du nouveau mot de passe,
     * et resetPassword consomme le code.
     */
    public function verifyResetCode(string $email, string $code): AuthResult
    {
        $email = $this->normalizeEmail($email);
        $token = $this->tokens->findActiveByHash(TokenHash::forResetCode($email, $code), 'password_reset');

        if ($token === null) {
            return AuthResult::failure('Code invalide ou expiré.', 422);
        }

        return AuthResult::success('Code vérifié.', [
            'email' => $email,
        ]);
    }

    public function resetPassword(
        string $email,
        string $code,
        string $newPassword,
        string $ip,
        string $userAgent,
    ): AuthResult {
        $email = $this->normalizeEmail($email);
        $token = $this->tokens->findActiveByHash(TokenHash::forResetCode($email, $code), 'password_reset');

        if ($token === null) {
            return AuthResult::failure('Code invalide ou expiré.', 422);
        }

        $user = $this->users->find($token['user_id']);

        if (! is_array($user) || $user['employment_status'] !== 'active') {
            return AuthResult::failure('Ce compte ne peut plus être réinitialisé.', 403);
        }

        $this->users->update($user['id'], [
            'password_hash' => UserModel::hashPassword($newPassword),
        ]);

        $this->tokens->revoke((string) $token['id']);
        $this->tokens->revokeAllForUser((string) $user['id']);

        $this->audit->record((string) $user['id'], 'auth', 'password_reset', 'users', (string) $user['id'], [
            'ip' => $ip,
            'user_agent' => $userAgent,
        ]);

        return AuthResult::success('Mot de passe mis à jour. Vous pouvez vous connecter.');
    }

    public function changePassword(
        string $userId,
        string $currentPassword,
        string $newPassword,
        string $ip,
        string $userAgent,
    ): AuthResult {
        $user = $this->users->find($userId);

        if (! is_array($user)) {
            return AuthResult::failure('Session invalide.', 401);
        }

        if (! UserModel::verifyPassword($currentPassword, (string) $user['password_hash'])) {
            return AuthResult::failure('Le mot de passe actuel est incorrect.', 422);
        }

        $this->users->update($userId, [
            'password_hash' => UserModel::hashPassword($newPassword),
        ]);

        // Les autres appareils doivent se reconnecter avec le nouveau mot de passe.
        $this->tokens->revokeAllForUser($userId);
        $session = $this->issueSession($userId, false);

        $this->audit->record($userId, 'auth', 'password_changed', 'users', $userId, [
            'ip' => $ip,
            'user_agent' => $userAgent,
        ]);

        return AuthResult::success('Mot de passe modifié.', [
            'token'        => $session['access'],
            'refreshToken' => $session['refresh'],
            'expiresIn'    => $this->config()->accessTokenTtl,
        ]);
    }

    public function requestAccess(string $fullName, string $email, ?string $message, string $ip, string $userAgent): AuthResult
    {
        $email    = $this->normalizeEmail($email);
        $fullName = trim($fullName);
        $reply    = 'Si cette adresse peut recevoir un accès, la demande a été enregistrée.';

        $alreadyUser = $this->users->findByEmail($email) !== null;
        $alreadyPending = $this->accessRequests->hasPending($email);

        if (! $alreadyUser && ! $alreadyPending) {
            $this->accessRequests->insert([
                'full_name'  => $fullName,
                'work_email' => $email,
                'message'    => $message !== null && trim($message) !== '' ? trim($message) : null,
                'status'     => 'pending',
            ]);

            $this->audit->record(null, 'auth', 'access_requested', 'access_requests', null, [
                'ip' => $ip,
                'user_agent' => $userAgent,
            ]);
        }

        return AuthResult::success($reply);
    }

    /**
     * @return array{access: string, refresh: string}
     */
    private function issueSession(string $userId, bool $remember): array
    {
        $access  = bin2hex(random_bytes(32));
        $refresh = bin2hex(random_bytes(32));
        $config  = $this->config();
        $refreshTtl = $remember ? $config->rememberRefreshTokenTtl : $config->refreshTokenTtl;

        $this->tokens->insert([
            'user_id'    => $userId,
            'type'       => 'access',
            'token_hash' => TokenHash::forSecret($access),
            'expires_at' => Timestamps::after($config->accessTokenTtl),
        ]);

        $this->tokens->insert([
            'user_id'    => $userId,
            'type'       => 'refresh',
            'token_hash' => TokenHash::forSecret($refresh),
            'expires_at' => Timestamps::after($refreshTtl),
        ]);

        return [
            'access'  => $access,
            'refresh' => $refresh,
        ];
    }

    /**
     * Le service Throttler de CodeIgniter compte les essais dans le cache.
     * La clé mélange l'adresse IP et l'email, sans garder l'email en clair.
     */
    private function allowAttempt(string $bucket, string $ip, string $email, int $capacity, int $window): bool
    {
        $key = md5($bucket . '|' . $ip . '|' . $email);

        return service('throttler')->check($key, $capacity, $window);
    }

    /**
     * @param array<string, mixed> $token
     */
    private function tokenLooksRemembered(array $token): bool
    {
        $createdAt = strtotime((string) ($token['created_at'] ?? ''));
        $expiresAt = strtotime((string) ($token['expires_at'] ?? ''));

        if ($createdAt === false || $expiresAt === false) {
            return false;
        }

        return ($expiresAt - $createdAt) > $this->config()->refreshTokenTtl;
    }

    private function sendResetCode(string $email, string $firstName, string $code): void
    {
        // En développement, le mail part rarement. Le code est alors écrit
        // dans le journal pour pouvoir tester. Il n'est jamais renvoyé dans l'API.
        if (ENVIRONMENT === 'development') {
            log_message('notice', 'Code de réinitialisation pour {email} : {code}', [
                'email' => $email,
                'code'  => $code,
            ]);
        }

        try {
            $mail = service('email');
            $mail->setTo($email);
            $mail->setSubject('Code de réinitialisation Presencia');
            $mail->setMessage(view('emails/password_reset', [
                'firstName' => $firstName,
                'code'      => $code,
                'minutes'   => (int) ($this->config()->passwordResetTtl / 60),
            ]));
            $mail->send();
        } catch (Throwable $exception) {
            log_message('error', 'Envoi du code de réinitialisation impossible : {message}', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    private function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    private function config(): Auth
    {
        return config(Auth::class);
    }
}
