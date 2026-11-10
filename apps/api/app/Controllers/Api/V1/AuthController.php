<?php

namespace App\Controllers\Api\V1;

use Config\Validation;
use OpenApi\Spec as OA;

/**
 * Connexion, session, mot de passe oublié et demande d'accès.
 *
 * Le contrôleur vérifie la saisie (bibliothèque Validation de CodeIgniter)
 * puis laisse AuthService décider. Il ne contient pas de règle métier.
 */
class AuthController extends ApiController
{
    #[OA\Operation\Post(
        path: '/api/v1/auth/login',
        operationId: 'login',
        tags: ['Authentification'],
        summary: 'Démarrer la connexion',
        description: 'Vérifie l\'email et le mot de passe, puis envoie un code à six chiffres. Aucun jeton n\'est émis à cette étape. Cinq tentatives sont autorisées par adresse IP et par email, sur 15 minutes.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/LoginRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Code envoyé.', content: new OA\Schema(ref: '#/components/schemas/LoginChallengeResponse')),
            new OA\Response(response: 401, description: 'Email ou mot de passe incorrect.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Compte suspendu ou inactif.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Saisie incomplète ou invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 429, description: 'Trop de tentatives.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function login()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authLogin)) {
            return $this->invalidInput();
        }

        $result = service('auth')->login(
            (string) $input['email'],
            (string) $input['password'],
            $this->isChecked($input['remember'] ?? false),
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/refresh',
        operationId: 'refreshSession',
        tags: ['Authentification'],
        summary: 'Renouveler la session',
        description: 'Échange un jeton de renouvellement contre une nouvelle paire. L\'ancien jeton est consommé. S\'il est présenté une seconde fois, toutes les sessions de la personne sont fermées.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/RefreshRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Nouvelle paire de jetons.', content: new OA\Schema(ref: '#/components/schemas/SessionResponse')),
            new OA\Response(response: 401, description: 'Jeton inconnu, déjà utilisé ou expiré.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le compte ne peut plus se connecter.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Jeton de renouvellement absent ou trop court.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function refresh()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authRefresh)) {
            return $this->invalidInput();
        }

        $result = service('auth')->refresh(
            (string) $input['refreshToken'],
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/logout',
        operationId: 'logout',
        tags: ['Authentification'],
        summary: 'Fermer la session',
        description: 'Révoque le jeton d\'accès présenté dans `Authorization: Bearer`, le jeton de renouvellement du corps, ou les deux. La réponse reste un succès même si les jetons sont déjà périmés.',
        parameters: [
            new OA\Parameter\Header(
                name: 'Authorization',
                required: false,
                description: 'Facultatif. Forme attendue : `Bearer {jeton d\'accès}`.',
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\Schema(ref: '#/components/schemas/LogoutRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Déconnexion acceptée.', content: new OA\Schema(ref: '#/components/schemas/MessageResponse')),
        ],
    )]
    public function logout()
    {
        $input  = $this->input();
        $header = $this->request->getHeaderLine('Authorization');
        $access = str_starts_with($header, 'Bearer ') ? trim(substr($header, 7)) : null;

        $result = service('auth')->logout(
            $access,
            isset($input['refreshToken']) ? (string) $input['refreshToken'] : null,
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Get(
        path: '/api/v1/auth/me',
        operationId: 'currentUser',
        tags: ['Authentification'],
        summary: 'Profil de la session',
        description: 'Réservé à un compte connecté et actif.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        responses: [
            new OA\Response(response: 200, description: 'Profil public.', content: new OA\Schema(ref: '#/components/schemas/MeResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function me()
    {
        $user = service('auth')->currentUser();

        if ($user === null) {
            return $this->failMessage('Session invalide.', 401);
        }

        return $this->ok('Profil chargé.', [
            'user' => \App\Models\UserModel::toPublic($user),
        ]);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/forgot-password',
        operationId: 'forgotPassword',
        tags: ['Authentification'],
        summary: 'Demander un code de réinitialisation',
        description: 'La réponse est la même que l\'email corresponde à un compte actif ou non. Trois demandes sont autorisées par adresse IP et par email, sur une heure. Le code expire au bout de 15 minutes.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/ForgotPasswordRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Demande acceptée, sans indiquer si le compte existe.', content: new OA\Schema(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 422, description: 'Email absent ou invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 429, description: 'Trop de demandes.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function forgotPassword()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authForgot)) {
            return $this->invalidInput();
        }

        $result = service('auth')->forgotPassword(
            (string) $input['email'],
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/verify-otp',
        operationId: 'verifyLoginOtp',
        tags: ['Authentification'],
        summary: 'Terminer la connexion',
        description: 'Vérifie le défi ouvert par `login` et le code reçu par email, puis émet les jetons. Le défi et le code doivent être ceux de la même session PHP. Cinq codes incorrects, ou un défi expiré, annulent la tentative.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/VerifyOtpRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Session ouverte.', content: new OA\Schema(ref: '#/components/schemas/SessionResponse')),
            new OA\Response(response: 401, description: 'Défi invalide, expiré ou différent de celui en cours.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 403, description: 'Le compte ne peut plus se connecter.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Code incorrect ou saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 429, description: 'Trop de codes incorrects.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function verifyOtp()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authVerifyLogin)) {
            return $this->invalidInput();
        }

        $result = service('auth')->verifyLoginOtp(
            (string) $input['challenge_id'],
            (string) $input['code'],
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/verify-reset-code',
        operationId: 'verifyResetCode',
        tags: ['Authentification'],
        summary: 'Vérifier le code de réinitialisation',
        description: 'Contrôle le code sans le consommer. `reset-password` le consomme ensuite.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/VerifyResetCodeRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Code encore valable.', content: new OA\Schema(ref: '#/components/schemas/ResetCodeResponse')),
            new OA\Response(response: 422, description: 'Code invalide, expiré, ou saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function verifyResetCode()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authVerifyCode)) {
            return $this->invalidInput();
        }

        $result = service('auth')->verifyResetCode(
            (string) $input['email'],
            (string) $input['code'],
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/reset-password',
        operationId: 'resetPassword',
        tags: ['Authentification'],
        summary: 'Choisir un nouveau mot de passe',
        description: 'Consomme le code de réinitialisation, met à jour le mot de passe et ferme toutes les sessions.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/ResetPasswordRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Mot de passe mis à jour.', content: new OA\Schema(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 403, description: 'Le compte ne peut plus être réinitialisé.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Code invalide, mots de passe différents, ou saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function resetPassword()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authReset)) {
            return $this->invalidInput();
        }

        if (! $this->passwordsMatch($input)) {
            return $this->passwordMismatch();
        }

        $result = service('auth')->resetPassword(
            (string) $input['email'],
            (string) $input['code'],
            (string) $input['password'],
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Put(
        path: '/api/v1/auth/password',
        operationId: 'changePassword',
        tags: ['Authentification'],
        summary: 'Changer le mot de passe',
        description: 'Réservé à un compte connecté. Les autres sessions sont fermées. La réponse contient une nouvelle paire de jetons pour l\'appareil en cours.',
        security: [new OA\Security\Requirement(scheme: 'bearerAuth')],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/ChangePasswordRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Mot de passe modifié et session renouvelée.', content: new OA\Schema(ref: '#/components/schemas/TokensResponse')),
            new OA\Response(response: 401, description: 'Jeton manquant, expiré ou révoqué.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Mot de passe actuel incorrect, confirmation différente, ou saisie invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function changePassword()
    {
        $user = service('auth')->currentUser();

        if ($user === null) {
            return $this->failMessage('Session invalide.', 401);
        }

        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authChangePassword)) {
            return $this->invalidInput();
        }

        if (! $this->passwordsMatch($input)) {
            return $this->passwordMismatch();
        }

        $result = service('auth')->changePassword(
            (string) $user['id'],
            (string) $input['current_password'],
            (string) $input['password'],
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    #[OA\Operation\Post(
        path: '/api/v1/auth/request-access',
        operationId: 'requestAccess',
        tags: ['Authentification'],
        summary: 'Demander un accès',
        description: 'Enregistre la demande si l\'email n\'est pas déjà celui d\'un compte ou d\'une demande en attente. La réponse ne dit pas lequel des deux cas s\'applique.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\Schema(ref: '#/components/schemas/RequestAccessRequest'),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Demande acceptée, sans préciser si elle a été enregistrée.', content: new OA\Schema(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 422, description: 'Saisie incomplète ou invalide.', content: new OA\Schema(ref: '#/components/schemas/ErrorResponse')),
        ],
    )]
    public function requestAccess()
    {
        $input = $this->input();

        if (! $this->validateData($input, config(Validation::class)->authRequestAccess)) {
            return $this->invalidInput();
        }

        $result = service('auth')->requestAccess(
            (string) $input['full_name'],
            (string) $input['work_email'],
            isset($input['message']) ? (string) $input['message'] : null,
            $this->request->getIPAddress(),
            $this->userAgent(),
        );

        return $this->fromResult($result);
    }

    /**
     * Corps JSON de la requête, avec les noms de champs alignés.
     *
     * L'application web envoie parfois du camelCase (rememberMe, refreshToken).
     * Les règles de validation, elles, utilisent un seul nom par champ.
     *
     * @return array<string, mixed>
     */
    private function input(): array
    {
        $json = $this->request->getJSON(true);
        $data = is_array($json) ? $json : [];

        $email = $data['email'] ?? $data['work_email'] ?? $data['workEmail'] ?? null;
        if ($email !== null) {
            $data['email'] = $email;
        }

        if (array_key_exists('rememberMe', $data)) {
            $data['remember'] = $data['rememberMe'];
        } elseif (array_key_exists('remember_me', $data)) {
            $data['remember'] = $data['remember_me'];
        }

        if (! isset($data['refreshToken']) && isset($data['refresh_token'])) {
            $data['refreshToken'] = $data['refresh_token'];
        }

        if (! isset($data['code']) && isset($data['otp'])) {
            $data['code'] = $data['otp'];
        }

        if (! isset($data['challenge_id']) && isset($data['challengeId'])) {
            $data['challenge_id'] = $data['challengeId'];
        }

        if (! isset($data['full_name']) && isset($data['fullName'])) {
            $data['full_name'] = $data['fullName'];
        }

        if (! isset($data['work_email'])) {
            $data['work_email'] = $data['workEmail'] ?? $data['email'] ?? null;
        }

        if (! isset($data['current_password']) && isset($data['currentPassword'])) {
            $data['current_password'] = $data['currentPassword'];
        }

        if (! isset($data['password']) && isset($data['newPassword'])) {
            $data['password'] = $data['newPassword'];
        }

        if (! isset($data['password_confirmation']) && isset($data['passwordConfirmation'])) {
            $data['password_confirmation'] = $data['passwordConfirmation'];
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $input
     */
    private function passwordsMatch(array $input): bool
    {
        if (! isset($input['password_confirmation'])) {
            return true;
        }

        return (string) $input['password_confirmation'] === (string) $input['password'];
    }

    private function passwordMismatch()
    {
        return $this->failMessage('Les deux mots de passe ne correspondent pas.', 422, [
            'password_confirmation' => 'Les deux mots de passe ne correspondent pas.',
        ]);
    }

    private function invalidInput()
    {
        return $this->failMessage(
            'Les informations envoyées sont incomplètes ou invalides.',
            422,
            $this->validator->getErrors(),
        );
    }

    private function fromResult(\App\Libraries\AuthResult $result)
    {
        if (! $result->ok) {
            return $this->failMessage($result->message, $result->status, $result->errors);
        }

        return $this->ok($result->message, $result->data, $result->status);
    }

    private function userAgent(): string
    {
        return (string) $this->request->getUserAgent();
    }

    private function isChecked(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
