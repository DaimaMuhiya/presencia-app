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

    public array $authVerifyLogin = [
        'challenge_id' => [
            'label'  => 'Défi de connexion',
            'rules'  => 'required|min_length[20]|max_length[128]',
            'errors' => [
                'required'   => 'Le défi de connexion est obligatoire.',
                'min_length' => 'Le défi de connexion n\'est pas valide.',
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

    // --------------------------------------------------------------------
    // Comptes (super administrateur)
    // --------------------------------------------------------------------

    public array $userCreate = [
        'first_name' => [
            'label'  => 'Prénom',
            'rules'  => 'required|min_length[1]|max_length[100]',
            'errors' => [
                'required' => 'Le prénom est obligatoire.',
            ],
        ],
        'last_name' => [
            'label'  => 'Nom',
            'rules'  => 'required|min_length[1]|max_length[100]',
            'errors' => [
                'required' => 'Le nom est obligatoire.',
            ],
        ],
        'work_email' => [
            'label'  => 'Email professionnel',
            'rules'  => 'required|valid_email|max_length[150]|is_unique[users.work_email]',
            'errors' => [
                'required'    => 'L\'email professionnel est obligatoire.',
                'valid_email' => 'L\'email professionnel n\'est pas valide.',
                'is_unique'   => 'Cet email est déjà utilisé.',
            ],
        ],
        'phone' => [
            'label' => 'Téléphone',
            'rules' => 'permit_empty|max_length[30]',
        ],
        'role' => [
            'label'  => 'Rôle',
            'rules'  => 'permit_empty|in_list[super_admin,admin,employee]',
            'errors' => [
                'in_list' => 'Le rôle doit être super_admin, admin ou employee.',
            ],
        ],
        'employment_status' => [
            'label'  => 'Statut',
            'rules'  => 'permit_empty|in_list[active,inactive,suspended]',
            'errors' => [
                'in_list' => 'Le statut doit être active, inactive ou suspended.',
            ],
        ],
        'job_title' => [
            'label' => 'Poste',
            'rules' => 'permit_empty|max_length[100]',
        ],
        'joining_date' => [
            'label'  => 'Date d\'entrée',
            'rules'  => 'permit_empty|valid_date[Y-m-d]',
            'errors' => [
                'valid_date' => 'La date d\'entrée doit être au format AAAA-MM-JJ.',
            ],
        ],
        'avatar_url' => [
            'label' => 'Avatar',
            'rules' => 'permit_empty|max_length[2048]',
        ],
        'push_enabled' => [
            'label'  => 'Notifications push',
            'rules'  => 'permit_empty|in_list[0,1]',
            'errors' => [
                'in_list' => 'La préférence de notification push doit être vrai ou faux.',
            ],
        ],
        'email_enabled' => [
            'label'  => 'Notifications email',
            'rules'  => 'permit_empty|in_list[0,1]',
            'errors' => [
                'in_list' => 'La préférence de notification email doit être vrai ou faux.',
            ],
        ],
    ];

    /**
     * Mêmes contraintes qu'à la création, en ignorant le compte modifié
     * pour l'unicité de l'email et du matricule.
     *
     * @return array<string, array<string, mixed>>
     */
    public function userUpdate(string $id): array
    {
        $rules = $this->userCreate;

        $rules['work_email']['rules'] = 'required|valid_email|max_length[150]|is_unique[users.work_email,id,' . $id . ']';
        $rules['password'] = [
            'label'  => 'Mot de passe',
            'rules'  => 'permit_empty|min_length[8]|max_length[255]',
            'errors' => [
                'min_length' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ],
        ];

        return $rules;
    }

    public array $userStatus = [
        'employment_status' => [
            'label'  => 'Statut',
            'rules'  => 'required|in_list[active,inactive,suspended]',
            'errors' => [
                'required' => 'Le statut est obligatoire.',
                'in_list'  => 'Le statut doit être active, inactive ou suspended.',
            ],
        ],
    ];
}
