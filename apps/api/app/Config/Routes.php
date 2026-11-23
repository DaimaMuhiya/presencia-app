<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Documentation interactive. Le contrat est public/openapi.json.
$routes->get('api/docs', 'Swagger::index');

// Le navigateur envoie OPTIONS avant un appel depuis un autre port.
// Le filtre cors répond à cette prévérification.
$routes->options('api/v1/(:any)', static function () {
    return service('response')->setStatusCode(204);
});

$routes->group('api/v1', ['namespace' => 'App\Controllers\Api\V1'], static function ($routes) {
    // QR dynamiques : affichage ouvert.
    $routes->get('qr/current', 'QrController::current');

    $routes->group('auth', static function ($routes) {
        // Routes ouvertes : pas encore de session.
        $routes->post('login', 'AuthController::login');
        $routes->post('refresh', 'AuthController::refresh');
        $routes->post('logout', 'AuthController::logout');
        $routes->post('forgot-password', 'AuthController::forgotPassword');
        $routes->post('verify-otp', 'AuthController::verifyOtp');
        $routes->post('verify-reset-code', 'AuthController::verifyResetCode');
        $routes->post('reset-password', 'AuthController::resetPassword');
        $routes->post('request-access', 'AuthController::requestAccess');
    });

    // Jeton Bearer requis.
    $routes->group('', ['filter' => 'auth'], static function ($routes) {
        $routes->get('auth/me', 'AuthController::me'); // récupères les infos de l'utilisateur connecté.
        $routes->put('auth/password', 'AuthController::changePassword'); // change le mot de passe.
        $routes->post('qr/consume', 'QrController::consume'); // consomme le QR (test / legacy).
        $routes->post('attendance/punch', 'AttendanceController::punch'); // pointage QR.
        $routes->get('attendance/me', 'AttendanceController::myAttendances'); // mes présences.
    });

    // Routes protégés par le role super_admin.
    $routes->group('super-admin', ['filter' => 'auth:super_admin'], static function ($routes) {
        $routes->get('users', 'UsersController::index');
        $routes->post('users', 'UsersController::create');
        $routes->put('users/(:segment)/status', 'UsersController::updateStatus');
        $routes->get('users/(:segment)', 'UsersController::show');
        $routes->put('users/(:segment)', 'UsersController::update');
        $routes->delete('users/(:segment)', 'UsersController::delete');

        $routes->get('schedules', 'SchedulesController::index');
        $routes->post('schedules', 'SchedulesController::create');
        $routes->put('schedules/(:segment)', 'SchedulesController::update');
        $routes->delete('schedules/(:segment)', 'SchedulesController::delete');

        $routes->get('attendances', 'AttendancesController::index');
        $routes->get('scan-logs', 'AttendancesController::scanLogs');

        $routes->get('exports', 'ExportsController::index');
        $routes->post('exports', 'ExportsController::create');
        $routes->get('exports/(:segment)', 'ExportsController::show');
    });
});