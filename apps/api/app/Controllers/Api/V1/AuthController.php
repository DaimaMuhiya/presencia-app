<?php

namespace App\Controllers\Api\V1;

use Config\Validation;

/**
 * Connexion, session, mot de passe oublié et demande d'accès.
 *
 * Le contrôleur vérifie la saisie (bibliothèque Validation de CodeIgniter)
 * puis laisse AuthService décider. Il ne contient pas de règle métier.
 */
class AuthController extends ApiController
{
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
