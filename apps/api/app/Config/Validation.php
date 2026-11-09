<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;
use CodeIgniter\Validation\StrictRules\CreditCardRules;
use CodeIgniter\Validation\StrictRules\FileRules;
use CodeIgniter\Validation\StrictRules\FormatRules;
use CodeIgniter\Validation\StrictRules\Rules;

class Validation extends BaseConfig
{
    // --------------------------------------------------------------------
    // Setup
    // --------------------------------------------------------------------

    /**
     * Stores the classes that contain the
     * rules that are available.
     *
     * @var list<string>
     */
    public array $ruleSets = [
        Rules::class,
        FormatRules::class,
        FileRules::class,
        CreditCardRules::class,
    ];

    /**
     * Specifies the views that are used to display the
     * errors.
     *
     * @var array<string, string>
     */
    public array $templates = [
        'list'   => 'CodeIgniter\Validation\Views\list',
        'single' => 'CodeIgniter\Validation\Views\single',
    ];

    // --------------------------------------------------------------------
    // Authentification
    // --------------------------------------------------------------------

    public array $authLogin = [
        'email' => [
            'label'  => 'Adresse email',
            'rules'  => 'required|valid_email|max_length[150]',
            'errors' => [
                'required'    => 'L\'adresse email est obligatoire.',
                'valid_email' => 'L\'adresse email n\'est pas valide.',
            ],
        ],
        'password' => [
            'label'  => 'Mot de passe',
            'rules'  => 'required|min_length[8]|max_length[255]',
            'errors' => [
                'required'   => 'Le mot de passe est obligatoire.',
                'min_length' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ],
        ],
    ];

    public array $authRefresh = [
        'refreshToken' => [
            'label'  => 'Jeton de renouvellement',
            'rules'  => 'required|min_length[20]',
            'errors' => [
                'required' => 'Le jeton de renouvellement est obligatoire.',
            ],
        ],
    ];

    public array $authForgot = [
        'email' => [
            'label'  => 'Adresse email',
            'rules'  => 'required|valid_email|max_length[150]',
            'errors' => [
                'required'    => 'L\'adresse email est obligatoire.',
                'valid_email' => 'L\'adresse email n\'est pas valide.',
            ],
        ],
    ];

    public array $authVerifyCode = [
        'email' => [
            'label'  => 'Adresse email',
            'rules'  => 'required|valid_email|max_length[150]',
            'errors' => [
                'required'    => 'L\'adresse email est obligatoire.',
                'valid_email' => 'L\'adresse email n\'est pas valide.',
            ],
        ],
        'code' => [
            'label'  => 'Code',
            'rules'  => 'required|regex_match[/^\d{6}$/]',
            'errors' => [
                'required'    => 'Le code est obligatoire.',
                'regex_match' => 'Le code doit contenir 6 chiffres.',
            ],
        ],
    ];

    public array $authReset = [
        'email' => [
            'label'  => 'Adresse email',
            'rules'  => 'required|valid_email|max_length[150]',
            'errors' => [
                'required'    => 'L\'adresse email est obligatoire.',
                'valid_email' => 'L\'adresse email n\'est pas valide.',
            ],
        ],
        'code' => [
            'label'  => 'Code',
            'rules'  => 'required|regex_match[/^\d{6}$/]',
            'errors' => [
                'required'    => 'Le code est obligatoire.',
                'regex_match' => 'Le code doit contenir 6 chiffres.',
            ],
        ],
        'password' => [
            'label'  => 'Nouveau mot de passe',
            'rules'  => 'required|min_length[8]|max_length[255]',
            'errors' => [
                'required'   => 'Le nouveau mot de passe est obligatoire.',
                'min_length' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ],
        ],
    ];

    public array $authChangePassword = [
        'current_password' => [
            'label'  => 'Mot de passe actuel',
            'rules'  => 'required',
            'errors' => [
                'required' => 'Le mot de passe actuel est obligatoire.',
            ],
        ],
        'password' => [
            'label'  => 'Nouveau mot de passe',
            'rules'  => 'required|min_length[8]|max_length[255]',
            'errors' => [
                'required'   => 'Le nouveau mot de passe est obligatoire.',
                'min_length' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ],
        ],
    ];

    public array $authRequestAccess = [
        'full_name' => [
            'label'  => 'Nom complet',
            'rules'  => 'required|min_length[2]|max_length[200]',
            'errors' => [
                'required' => 'Le nom complet est obligatoire.',
            ],
        ],
        'work_email' => [
            'label'  => 'Email professionnel',
            'rules'  => 'required|valid_email|max_length[150]',
            'errors' => [
                'required'    => 'L\'email professionnel est obligatoire.',
                'valid_email' => 'L\'email professionnel n\'est pas valide.',
            ],
        ],
        'message' => [
            'label' => 'Message',
            'rules' => 'permit_empty|max_length[2000]',
        ],
    ];
}
