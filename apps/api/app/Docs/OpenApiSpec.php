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

La durée du jeton d'accès est réglée par `AUTH_ACCESS_TOKEN_TTL_SECONDS` dans `.env` (défaut 900 s, soit 15 minutes). Le jeton de renouvellement dure 12 heures, ou 30 jours si « garder ma session » a été demandé. Les deux ne sont stockés que sous forme d'empreinte.

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
#[OA\Tag(
    name: 'Comptes',
    description: 'Création et gestion des comptes. Réservé au rôle super_admin.',
)]
#[OA\Tag(
    name: 'QR dynamique',
    description: 'Jetons QR rotatifs pour le pointage. `hash_id` est la valeur à encoder dans l\'image QR. Durée de vie : variable d\'environnement `QR_TOKEN_TTL_SECONDS` (défaut 15 s).',
)]
#[OA\Tag(
    name: 'Horaires',
    description: 'Modèles d\'horaires de travail : début, fin et tolérance avant retard. Réservé au super_admin.',
)]
#[OA\Tag(
    name: 'Présence',
    description: 'Pointage QR : arrivée / départ par jour. Horaire entreprise : premier horaire en base (mono-organisation).',
)]
#[OA\Tag(
    name: 'Exports',
    description: 'Export des présences sur une période. Réservé au super_admin. L\'API renvoie les lignes en JSON ; le front construit le fichier.',
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
#[OA\Schema(
    component: 'UserCreateRequest',
    type: 'object',
    description: 'Le matricule et le mot de passe ne font pas partie de la requête. L\'API les produit.',
    required: ['first_name', 'last_name', 'work_email'],
    example: [
        'first_name'         => 'Marie',
        'last_name'          => 'Dupont',
        'work_email'         => 'marie.dupont@example.com',
        'phone'              => '+243800000000',
        'role'               => 'employee',
        'employment_status'  => 'active',
        'job_title'          => 'Développeuse',
        'joining_date'       => '2026-11-10',
        'avatar_url'         => 'https://example.com/avatars/marie.png',
        'push_enabled'       => true,
        'email_enabled'      => true,
    ],
    properties: [
        new OA\Property(property: 'first_name', schema: new OA\Schema(type: 'string', maxLength: 100, example: 'Marie')),
        new OA\Property(property: 'last_name', schema: new OA\Schema(type: 'string', maxLength: 100, example: 'Dupont')),
        new OA\Property(property: 'work_email', schema: new OA\Schema(type: 'string', format: 'email', maxLength: 150, example: 'marie.dupont@example.com')),
        new OA\Property(property: 'phone', schema: new OA\Schema(type: 'string', maxLength: 30, nullable: true, example: '+243800000000')),
        new OA\Property(property: 'role', schema: new OA\Schema(type: 'string', enum: ['super_admin', 'admin', 'employee'], example: 'employee')),
        new OA\Property(property: 'employment_status', schema: new OA\Schema(type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active')),
        new OA\Property(property: 'job_title', schema: new OA\Schema(type: 'string', maxLength: 100, nullable: true, example: 'Développeuse')),
        new OA\Property(property: 'joining_date', schema: new OA\Schema(type: 'string', format: 'date', nullable: true, example: '2026-11-10')),
        new OA\Property(property: 'avatar_url', schema: new OA\Schema(
            type: 'string',
            maxLength: 2048,
            nullable: true,
            example: 'https://example.com/avatars/marie.png',
            description: 'Facultatif. null si le compte n\'a pas d\'avatar.',
        )),
        new OA\Property(property: 'push_enabled', schema: new OA\Schema(
            type: 'boolean',
            nullable: true,
            example: true,
            description: 'Facultatif. null ou absent active les notifications push.',
        )),
        new OA\Property(property: 'email_enabled', schema: new OA\Schema(
            type: 'boolean',
            nullable: true,
            example: true,
            description: 'Facultatif. null ou absent active les notifications email.',
        )),
    ],
)]
#[OA\Schema(
    component: 'UserUpdateRequest',
    type: 'object',
    description: 'Tous les champs sont facultatifs. Seuls ceux qui sont envoyés sont modifiés.',
    properties: [
        new OA\Property(property: 'first_name', schema: new OA\Schema(type: 'string', maxLength: 100)),
        new OA\Property(property: 'last_name', schema: new OA\Schema(type: 'string', maxLength: 100)),
        new OA\Property(property: 'work_email', schema: new OA\Schema(type: 'string', format: 'email', maxLength: 150)),
        new OA\Property(property: 'password', schema: new OA\Schema(type: 'string', format: 'password', minLength: 8, maxLength: 255, description: 'Facultatif. Remplace le mot de passe et ferme les sessions.')),
        new OA\Property(property: 'password_confirmation', schema: new OA\Schema(type: 'string', format: 'password')),
        new OA\Property(property: 'phone', schema: new OA\Schema(type: 'string', maxLength: 30, nullable: true)),
        new OA\Property(property: 'role', schema: new OA\Schema(type: 'string', enum: ['super_admin', 'admin', 'employee'])),
        new OA\Property(property: 'employment_status', schema: new OA\Schema(type: 'string', enum: ['active', 'inactive', 'suspended'])),
        new OA\Property(property: 'job_title', schema: new OA\Schema(type: 'string', maxLength: 100, nullable: true)),
        new OA\Property(property: 'joining_date', schema: new OA\Schema(type: 'string', format: 'date', nullable: true)),
        new OA\Property(property: 'avatar_url', schema: new OA\Schema(type: 'string', maxLength: 2048, nullable: true)),
        new OA\Property(property: 'push_enabled', schema: new OA\Schema(type: 'boolean', nullable: true)),
        new OA\Property(property: 'email_enabled', schema: new OA\Schema(type: 'boolean', nullable: true)),
    ],
)]
#[OA\Schema(
    component: 'UserStatusRequest',
    type: 'object',
    required: ['employment_status'],
    properties: [
        new OA\Property(property: 'employment_status', schema: new OA\Schema(
            type: 'string',
            enum: ['active', 'inactive', 'suspended'],
            example: 'suspended',
            description: 'Alias acceptés : employmentStatus, workStatus.',
        )),
    ],
)]
#[OA\Schema(
    component: 'UserItemResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Compte chargé.')),
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
    component: 'UserListResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Comptes chargés.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['users'],
            properties: [
                new OA\Property(property: 'users', schema: new OA\Schema(
                    type: 'array',
                    items: new OA\Schema(ref: '#/components/schemas/User'),
                )),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'QrToken',
    type: 'object',
    description: 'Jeton QR unique. Le front affiche le QR en encodant uniquement `hash_id` (texte brut, ex. `0x4f8a…`).',
    required: ['id', 'hash_id', 'issued_at', 'expires_at', 'refresh_seconds'],
    properties: [
        new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'hash_id', schema: new OA\Schema(type: 'string', example: '0x4f8a1b2c3d4e5f6789012345678901234567890ab')),
        new OA\Property(property: 'issued_at', schema: new OA\Schema(type: 'string', format: 'date-time', example: '2026-11-12 14:00:00')),
        new OA\Property(property: 'expires_at', schema: new OA\Schema(type: 'string', format: 'date-time', example: '2026-11-12 14:00:15')),
        new OA\Property(property: 'consumed_at', schema: new OA\Schema(type: 'string', format: 'date-time', nullable: true, example: null)),
        new OA\Property(property: 'refresh_seconds', schema: new OA\Schema(type: 'integer', example: 15, description: 'Miroir de `QR_REFRESH_SECONDS` côté serveur.')),
    ],
)]
#[OA\Schema(
    component: 'QrCurrentResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'QR actuel.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['qr'],
            properties: [
                new OA\Property(property: 'qr', schema: new OA\Schema(ref: '#/components/schemas/QrToken')),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'QrConsumeRequest',
    type: 'object',
    required: ['hash_id'],
    properties: [
        new OA\Property(property: 'hash_id', schema: new OA\Schema(
            type: 'string',
            maxLength: 100,
            example: '0x4f8a1b2c3d4e5f6789012345678901234567890ab',
            description: 'Valeur lue depuis le QR. Alias accepté : `hashId`.',
        )),
    ],
)]
#[OA\Schema(
    component: 'QrConsumeResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'QR consommé.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['consumed', 'replacement'],
            properties: [
                new OA\Property(property: 'consumed', schema: new OA\Schema(ref: '#/components/schemas/QrToken')),
                new OA\Property(property: 'replacement', schema: new OA\Schema(ref: '#/components/schemas/QrToken', nullable: true)),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'Schedule',
    type: 'object',
    required: ['id', 'start_time', 'end_time', 'grace_minutes'],
    properties: [
        new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'start_time', schema: new OA\Schema(type: 'string', format: 'time', example: '08:00:00', description: 'Heure de début (HH:MM:SS). Alias renvoyé : startTime.')),
        new OA\Property(property: 'end_time', schema: new OA\Schema(type: 'string', format: 'time', example: '16:00:00', description: 'Heure de fin. Alias : endTime.')),
        new OA\Property(property: 'startTime', schema: new OA\Schema(type: 'string', format: 'time', example: '08:00:00')),
        new OA\Property(property: 'endTime', schema: new OA\Schema(type: 'string', format: 'time', example: '16:00:00')),
        new OA\Property(property: 'grace_minutes', schema: new OA\Schema(type: 'integer', example: 10, description: 'Minutes de tolérance après l\'heure de début. Alias : graceMinutes.')),
        new OA\Property(property: 'graceMinutes', schema: new OA\Schema(type: 'integer', example: 10)),
    ],
)]
#[OA\Schema(
    component: 'ScheduleWriteRequest',
    type: 'object',
    required: ['start_time', 'end_time'],
    properties: [
        new OA\Property(property: 'start_time', schema: new OA\Schema(type: 'string', example: '08:00', description: 'HH:MM ou HH:MM:SS. Alias : startTime.')),
        new OA\Property(property: 'end_time', schema: new OA\Schema(type: 'string', example: '16:00', description: 'Doit être après start_time. Alias : endTime.')),
        new OA\Property(property: 'grace_minutes', schema: new OA\Schema(type: 'integer', minimum: 0, maximum: 480, example: 10, description: 'Défaut : 0. Alias : graceMinutes.')),
    ],
)]
#[OA\Schema(
    component: 'ScheduleItemResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Horaire créé.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['schedule'],
            properties: [
                new OA\Property(property: 'schedule', schema: new OA\Schema(ref: '#/components/schemas/Schedule')),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'ScheduleListResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Horaires chargés.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['schedules'],
            properties: [
                new OA\Property(property: 'schedules', schema: new OA\Schema(
                    type: 'array',
                    items: new OA\Schema(ref: '#/components/schemas/Schedule'),
                )),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'Attendance',
    type: 'object',
    required: ['id', 'user_id', 'attendance_date', 'status'],
    properties: [
        new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'user_id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'schedules_id', schema: new OA\Schema(type: 'string', format: 'uuid', nullable: true)),
        new OA\Property(property: 'attendance_date', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Property(property: 'arrival_at', schema: new OA\Schema(type: 'string', format: 'date-time', nullable: true)),
        new OA\Property(property: 'departure_at', schema: new OA\Schema(type: 'string', format: 'date-time', nullable: true)),
        new OA\Property(property: 'status', schema: new OA\Schema(type: 'string', enum: ['on_time', 'late', 'absent', 'exception'])),
    ],
)]
#[OA\Schema(
    component: 'ScanLog',
    type: 'object',
    required: ['id', 'user_id', 'method', 'scanned_at', 'is_success'],
    properties: [
        new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'attendance_id', schema: new OA\Schema(type: 'string', format: 'uuid', nullable: true)),
        new OA\Property(property: 'user_id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'qr_token_id', schema: new OA\Schema(type: 'string', format: 'uuid', nullable: true)),
        new OA\Property(property: 'method', schema: new OA\Schema(type: 'string', example: 'qr_scan')),
        new OA\Property(property: 'scanned_at', schema: new OA\Schema(type: 'string', format: 'date-time')),
        new OA\Property(property: 'is_success', schema: new OA\Schema(type: 'boolean')),
        new OA\Property(property: 'failure_reason', schema: new OA\Schema(type: 'string', nullable: true)),
    ],
)]
#[OA\Schema(
    component: 'AttendancePunchRequest',
    type: 'object',
    required: ['hash_id'],
    properties: [
        new OA\Property(property: 'hash_id', schema: new OA\Schema(type: 'string', description: 'Valeur lue dans le QR. Alias : hashId.')),
    ],
)]
#[OA\Schema(
    component: 'AttendancePunchResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string', example: 'Arrivée enregistrée.')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['punch_type', 'attendance', 'qr'],
            properties: [
                new OA\Property(property: 'punch_type', schema: new OA\Schema(type: 'string', enum: ['arrival', 'departure'])),
                new OA\Property(property: 'attendance', schema: new OA\Schema(ref: '#/components/schemas/Attendance')),
                new OA\Property(property: 'qr', schema: new OA\Schema(ref: '#/components/schemas/QrToken', description: 'QR affichable après rotation.')),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'AttendanceListResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['attendances'],
            properties: [
                new OA\Property(property: 'attendances', schema: new OA\Schema(
                    type: 'array',
                    items: new OA\Schema(ref: '#/components/schemas/Attendance'),
                )),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'ScanLogListResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['scan_logs'],
            properties: [
                new OA\Property(property: 'scan_logs', schema: new OA\Schema(
                    type: 'array',
                    items: new OA\Schema(ref: '#/components/schemas/ScanLog'),
                )),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'Export',
    type: 'object',
    required: ['id', 'start_date', 'end_date', 'created_at'],
    properties: [
        new OA\Property(property: 'id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'start_date', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Property(property: 'end_date', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Property(property: 'status_filter', schema: new OA\Schema(type: 'string', enum: ['on_time', 'late', 'absent', 'exception'], nullable: true)),
        new OA\Property(property: 'created_at', schema: new OA\Schema(type: 'string', format: 'date-time')),
    ],
)]
#[OA\Schema(
    component: 'ExportRow',
    type: 'object',
    required: ['attendance_id', 'attendance_date', 'status', 'user_id', 'first_name', 'last_name', 'work_email'],
    properties: [
        new OA\Property(property: 'attendance_id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'attendance_date', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Property(property: 'status', schema: new OA\Schema(type: 'string', enum: ['on_time', 'late', 'absent', 'exception'])),
        new OA\Property(property: 'arrival_at', schema: new OA\Schema(type: 'string', format: 'date-time', nullable: true)),
        new OA\Property(property: 'departure_at', schema: new OA\Schema(type: 'string', format: 'date-time', nullable: true)),
        new OA\Property(property: 'user_id', schema: new OA\Schema(type: 'string', format: 'uuid')),
        new OA\Property(property: 'employee_code', schema: new OA\Schema(type: 'string', nullable: true)),
        new OA\Property(property: 'first_name', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'last_name', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'work_email', schema: new OA\Schema(type: 'string', format: 'email')),
    ],
)]
#[OA\Schema(
    component: 'ExportWriteRequest',
    type: 'object',
    required: ['start_date', 'end_date'],
    properties: [
        new OA\Property(property: 'start_date', schema: new OA\Schema(type: 'string', format: 'date', description: 'Alias : startDate.')),
        new OA\Property(property: 'end_date', schema: new OA\Schema(type: 'string', format: 'date', description: 'Alias : endDate.')),
        new OA\Property(property: 'status_filter', schema: new OA\Schema(type: 'string', enum: ['on_time', 'late', 'absent', 'exception'], nullable: true, description: 'Alias : statusFilter. Absent = tous les statuts.')),
    ],
)]
#[OA\Schema(
    component: 'ExportListResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['exports'],
            properties: [
                new OA\Property(property: 'exports', schema: new OA\Schema(
                    type: 'array',
                    items: new OA\Schema(ref: '#/components/schemas/Export'),
                )),
            ],
        )),
    ],
)]
#[OA\Schema(
    component: 'ExportDataResponse',
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: [
        new OA\Property(property: 'success', schema: new OA\Schema(type: 'boolean', example: true)),
        new OA\Property(property: 'message', schema: new OA\Schema(type: 'string')),
        new OA\Property(property: 'data', schema: new OA\Schema(
            type: 'object',
            required: ['export', 'rows'],
            properties: [
                new OA\Property(property: 'export', schema: new OA\Schema(ref: '#/components/schemas/Export')),
                new OA\Property(property: 'rows', schema: new OA\Schema(
                    type: 'array',
                    items: new OA\Schema(ref: '#/components/schemas/ExportRow'),
                )),
            ],
        )),
    ],
)]
class OpenApiSpec
{
}
