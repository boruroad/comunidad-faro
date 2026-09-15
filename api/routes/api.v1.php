<?php

/**
 * Registra las 5 rutas REST estandar (index, detail, create, update, delete)
 * para un CrudController sobre $basePath.
 */
function register_crud($router, $basePath, $controllerClass)
{
    $controller = new $controllerClass();

    $router->add('GET', $basePath, function ($request) use ($controller) {
        return $controller->index($request);
    });

    $router->add('GET', $basePath . '/detail', function ($request) use ($controller) {
        return $controller->detail($request);
    });

    $router->add('POST', $basePath, function ($request) use ($controller) {
        return $controller->create($request);
    });

    $router->add('PUT', $basePath, function ($request) use ($controller) {
        return $controller->update($request);
    });

    $router->add('DELETE', $basePath, function ($request) use ($controller) {
        return $controller->delete($request);
    });
}

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------
$authController = new AuthController();

$router->add('POST', '/api/v1/auth/login', function ($request) use ($authController) {
    return $authController->login($request);
});

$router->add('POST', '/api/v1/auth/register', function ($request) use ($authController) {
    return $authController->register($request);
});

$router->add('POST', '/api/v1/auth/validate', function ($request) use ($authController) {
    return $authController->validate($request);
});

$router->add('POST', '/api/v1/auth/logout', function ($request) use ($authController) {
    return $authController->logout($request);
});

$router->add('POST', '/api/v1/auth/forgot-password', function ($request) use ($authController) {
    return $authController->forgotPassword($request);
});

$router->add('POST', '/api/v1/auth/validate-reset-token', function ($request) use ($authController) {
    return $authController->validateResetToken($request);
});

$router->add('POST', '/api/v1/auth/reset-password', function ($request) use ($authController) {
    return $authController->resetPassword($request);
});

// ---------------------------------------------------------------------
// Usuarios (gestion de cuentas; la creacion se hace via /auth/register)
// ---------------------------------------------------------------------
$usuarioController = new UsuarioController();

$router->add('GET', '/api/v1/usuarios/profile', function ($request) use ($usuarioController) {
    return $usuarioController->profile($request);
});

register_crud($router, '/api/v1/usuarios', 'UsuarioController');

// ---------------------------------------------------------------------
// Comunidades
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/comunidades', 'ComunidadController');

// ---------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/roles', 'RolController');

// ---------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/personas', 'PersonaController');

// ---------------------------------------------------------------------
// Auth tokens (consulta/revocacion administrativa)
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/auth-tokens', 'AuthTokenController');
