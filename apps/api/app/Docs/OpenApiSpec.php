<?php

namespace App\Docs;

use OpenApi\Spec as OA;

/**
 * Informations générales de l'API et schémas réutilisés par les opérations.
 *
 * Le jeton d'accès est opaque : ce n'est pas un JWT. Seule son empreinte
 * est conservée. Les routes protégées le lisent dans Authorization: Bearer.
 */
#[OA\Info(
    title: 'Presencia API',
    version: '1.0.0',
    summary: 'Authentification des employés, administrateurs et super administrateurs.',
    description: <<<'MD'
Les réponses sont en JSON : `success`, `message`, et `data` quand l'action produit un contenu. Une saisie invalide ajoute `errors`, champ par champ.

La connexion se fait en deux temps. Un mot de passe correct n'émet pas encore de jeton : il ouvre un défi de dix minutes et envoie un code à six chiffres par email. Les jetons ne sont créés qu'après `POST /api/v1/auth/verify-otp`.

Le jeton d'accès dure 15 minutes. Le jeton de renouvellement dure 12 heures, ou 30 jours si « garder ma session » a été demandé. Les deux ne sont stockés que sous forme d'empreinte.

Certains champs acceptent aussi un alias (`rememberMe`, `refresh_token`, `challengeId`, `otp`, `fullName`, `workEmail`, `currentPassword`, `newPassword`, `passwordConfirmation`). La documentation décrit le nom attendu par la validation.
MD,
)]
#[OA\Server(
    url: '/',
    description: 'Même origine que cette documentation.',
)]
#[OA\Tag(
    name: 'Authentification',
    description: 'Connexion, session, mot de passe oublié et demande d\'accès.',
)]
#[OA\Security\Scheme\Http(
    component: 'bearerAuth',
    scheme: 'bearer',
    description: 'Jeton d\'accès opaque renvoyé par la vérification du code de connexion. Ce n\'est pas un JWT. Exemple d\'en-tête : `Authorization: Bearer 7f3a…`.',
)]
#[OA\Schema(
    component: 'ErrorResponse',
    type: 'object',
    required: ['success', 'message'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: false)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Les informations envoyées sont incomplètes ou invalides.')),
        new OA\Property(property: 'errors', schema: new OA\Schema(
            type: 'object',
            description: 'Présent seulement quand la saisie est invalide.',
            additionalProperties: new OA\Schema\AdditionalProperties(type: 'string'),
            example: ['email' => 'L\'adresse email est obligatoire.'],
        )),
    ],
)]
#[OA\Schema(
    component: 'MessageResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'data', schema: new OA\Schema(type: 'object', nullable: true, example: null)),
    ],
)]
#[OA\Schema(
    component: 'User',
    type: 'object',
    description: 'Profil public. Le mot de passe n\'en fait jamais partie.',
    required: ['id', 'email', 'work_email', 'firstName', 'lastName', 'name', 'role', 'workStatus', 'employment_status'],
    properties: [
        new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'email', schema: new OA\Schema(type: 'string', format: 'email')),
        new OA\Property(property: 'work_email', schema: new OA\Schema(type: 'string', format: 'email')),
        new OA\Property(property: 'firstName', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'lastName', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'first_name', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'last_name', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'name', schema: new OA\Schema(type: 'string', example: 'Marie Dupont')),
        new OA\Property(property: 'employeeId', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'employee_code', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'position', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'job_title', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'role', schema: new OA\Schema(type: 'string', enum: ['super_admin', 'admin', 'employee'])),
        new OA\Property(property: 'workStatus', schema: new OA\Schema(type: 'string', enum: ['active', 'inactive', 'suspended'])),
        new OA\Property(property: 'employment_status', schema: new OA\Schema(type: 'string', enum: ['active', 'inactive', 'suspended'])),
        new OA\Property(property: 'joiningDate', schema: new OA\Schema(type: 'string', format: 'date', nullable: true)),
        new OA\Property(property: 'joining_date', schema: new OA\Schema(type: 'string', format: 'date', nullable: true)),
        new OA\Property(property: 'avatar', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'avatar_url', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'phone', schema: new OA\Schema(type: 'string', nullable: true)),
    ],
)]
#[OA\Schema(
    component: 'LoginRequest',
    type: 'object',
    required: ['email', 'password'],
    properties: [
        new OA\Property(property: 'email', schema: new OA\Schema(type: 'string', format: 'email', maxLength: 150, example: 'marie.dupont@example.com')),
        new OA\Property(property: 'password', schema: new OA\Schema(type: 'string', format: 'password', minLength: 8, maxLength: 255)),
        new OA\Property(property: 'remember', schema: new OA\Schema(
            type: 'boolean',
            description: 'Allonge le jeton de renouvellement à 30 jours. Alias acceptés : `rememberMe`, `remember_me`.',
            example: false,
        )),
    ],
)]
#[OA\Schema(
    component: 'LoginChallengeResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Un code de connexion a été envoyé par email.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['id', 'challenge_id'],
            properties: [
                new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
                new OA\Property(property: 'challenge_id', schema: new OA\Schema(type: 'string', description: 'À renvoyer avec le code reçu par email.', minLength: 20, maxLength: 128)),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'SessionResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Connexion réussie.')),
        new OA\Property(property: 'data', schema: new OA\Schema(ref: '#/components/schemas/SessionData')),
    ],
)]
#[OA\Schema(
    component: 'SessionData',
    type: 'object',
    required: ['user', 'token', 'refreshToken', 'expiresIn'],
    properties: [
        new OA\Property(property: 'user', schema: new OA\Schema(ref: '#/components/schemas/User')),
        new OA\Property(property: 'token', schema: new OA\Schema(type: 'string', description: 'Jeton d\'accès opaque à placer dans Authorization: Bearer.')),
        new OA\Property(property: 'refreshToken', schema: new OA\Schema(type: 'string', description: 'À usage unique. Le réutiliser ferme toutes les sessions.')),
        new OA\Property(property: 'expiresIn', schema: new OA\Schema(type: 'integer', description: 'Durée de vie du jeton d\'accès, en secondes.', example: 900)),
    ],
)]
#[OA\Schema(
    component: 'RefreshRequest',
    type: 'object',
    required: ['refreshToken'],
    properties: [
        new OA\Property(property: 'refreshToken', schema: new OA\Schema(
            type: 'string',
            minLength: 20,
            description: 'Alias accepté : `refresh_token`.',
        )),
    ],
)]
#[OA\Schema(
    component: 'LogoutRequest',
    type: 'object',
    properties: [
        new OA\Property(property: 'refreshToken', schema: new OA\Schema(
            type: 'string',
            description: 'Facultatif. Alias accepté : `refresh_token`.',
        )),
    ],
)]
#[OA\Schema(
    component: 'ForgotPasswordRequest',
    type: 'object',
    required: ['email'],
    properties: [
        new OA\Property(property: 'email', schema: new OA\Schema(type: 'string', format: 'email', maxLength: 150)),
    ],
)]
#[OA\Schema(
    component: 'VerifyOtpRequest',
    type: 'object',
    required: ['challenge_id', 'code'],
    properties: [
        new OA\Property(property: 'challenge_id', schema: new OA\Schema(
            type: 'string',
            minLength: 20,
            maxLength: 128,
            description: 'Alias accepté : `challengeId`.',
        )),
        new OA\Property(property: 'code', schema: new OA\Schema(
            type: 'string',
            pattern: '^\d{6}$',
            example: '123456',
            description: 'Code à six chiffres reçu par email. Alias accepté : `otp`.',
        )),
    ],
)]
#[OA\Schema(
    component: 'VerifyResetCodeRequest',
    type: 'object',
    required: ['email', 'code'],
    properties: [
        new OA\Property(property: 'email', schema: new OA\Schema(type: 'string', format: 'email', maxLength: 150)),
        new OA\Property(property: 'code', schema: new OA\Schema(type: 'string', pattern: '^\d{6}$', example: '123456')),
    ],
)]
#[OA\Schema(
    component: 'ResetCodeResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Code vérifié.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['email'],
            properties: [
                new OA\Property(property: 'email', schema: new OA\Schema(type: 'string', format: 'email')),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'ResetPasswordRequest',
    type: 'object',
    required: ['email', 'code', 'password'],
    properties: [
        new OA\Property(property: 'email', schema: new OA\Schema(type: 'string', format: 'email', maxLength: 150)),
        new OA\Property(property: 'code', schema: new OA\Schema(type: 'string', pattern: '^\d{6}$', example: '123456')),
        new OA\Property(property: 'password', schema: new OA\Schema(
            type: 'string',
            format: 'password',
            minLength: 8,
            maxLength: 255,
            description: 'Alias accepté : `newPassword`.',
        )),
        new OA\Property(property: 'password_confirmation', schema: new OA\Schema(
            type: 'string',
            format: 'password',
            description: 'Facultatif. S\'il est envoyé, il doit être identique à `password`. Alias accepté : `passwordConfirmation`.',
        )),
    ],
)]
#[OA\Schema(
    component: 'ChangePasswordRequest',
    type: 'object',
    required: ['current_password', 'password'],
    properties: [
        new OA\Property(property: 'current_password', schema: new OA\Schema(
            type: 'string',
            format: 'password',
            description: 'Alias accepté : `currentPassword`.',
        )),
        new OA\Property(property: 'password', schema: new OA\Schema(
            type: 'string',
            format: 'password',
            minLength: 8,
            maxLength: 255,
            description: 'Alias accepté : `newPassword`.',
        )),
        new OA\Property(property: 'password_confirmation', schema: new OA\Schema(
            type: 'string',
            format: 'password',
            description: 'Facultatif. S\'il est envoyé, il doit être identique à `password`. Alias accepté : `passwordConfirmation`.',
        )),
    ],
)]
#[OA\Schema(
    component: 'TokensResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Mot de passe modifié.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['token', 'refreshToken', 'expiresIn'],
            properties: [
                new OA\Property(property: 'token', schema: new OA\Schema(type: 'string')),
                new OA\Property(property: 'refreshToken', schema: new OA\Schema(type: 'string')),
                new OA\Property(property: 'expiresIn', schema: new OA\Schema(type: 'integer', example: 900)),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'MeResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Profil chargé.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['user'],
            properties: [
                new OA\Property(property: 'user', schema: new OA\Schema(ref: '#/components/schemas/User')),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'RequestAccessRequest',
    type: 'object',
    required: ['full_name', 'work_email'],
    properties: [
        new OA\Property(property: 'full_name', schema: new OA\Schema(
            type: 'string',
            minLength: 2,
            maxLength: 200,
            description: 'Alias accepté : `fullName`.',
            example: 'Marie Dupont',
        )),
        new OA\Property(property: 'work_email', schema: new OA\Schema(
            type: 'string',
            format: 'email',
            maxLength: 150,
            description: 'Alias acceptés : `workEmail`, `email`.',
            example: 'marie.dupont@example.com',
        )),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', maxLength: 2000, nullable: true)),
    ],
)]
class OpenApiSpec
{
}
