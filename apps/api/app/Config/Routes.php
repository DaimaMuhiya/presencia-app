<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Le navigateur envoie OPTIONS avant un appel depuis un autre port.
// Le filtre cors répond à cette prévérification.
$routes->options('api/v1/(:any)', static function () {
    return service('response')->setStatusCode(204);
});

$routes->group('api/v1', ['namespace' => 'App\Controllers\Api\V1'], static function ($routes) {
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

        // Routes protégées par le filtre auth (jeton Bearer).
        $routes->get('me', 'AuthController::me', ['filter' => 'auth']);
        $routes->put('password', 'AuthController::changePassword', ['filter' => 'auth']);
    });
});