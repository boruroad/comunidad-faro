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

// Activacion/desactivacion administrativa de cuentas autoregistradas.
$router->add('POST', '/api/v1/usuarios/activate', function ($request) use ($usuarioController) {
    return $usuarioController->activate($request);
});

$router->add('POST', '/api/v1/usuarios/deactivate', function ($request) use ($usuarioController) {
    return $usuarioController->deactivate($request);
});

register_crud($router, '/api/v1/usuarios', 'UsuarioController');

// ---------------------------------------------------------------------
// Comunidades
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/comunidades', 'ComunidadController');

// ---------------------------------------------------------------------
// Casas (catalogo asociado a una comunidad)
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/casas', 'CasaController');

// ---------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/roles', 'RolController');

// ---------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------
$personaController = new PersonaController();

// Catalogo para el filtro "Lider" (personas que ya lideran a alguien).
$router->add('GET', '/api/v1/personas/lideres', function ($request) use ($personaController) {
    return $personaController->lideres($request);
});

register_crud($router, '/api/v1/personas', 'PersonaController');

// ---------------------------------------------------------------------
// Personas interesadas (registro publico "¿Estas interesado?" + seguimiento interno)
// ---------------------------------------------------------------------
$personaInteresadaController = new PersonaInteresadaController();

// Publica: alta del formulario de interes, no requiere autenticacion
$router->add('POST', '/api/v1/personas-interesadas', function ($request) use ($personaInteresadaController) {
    return $personaInteresadaController->register($request);
});

// Administrativa: listar/consultar/actualizar seguimiento/eliminar (rol admin)
$router->add('GET', '/api/v1/personas-interesadas', function ($request) use ($personaInteresadaController) {
    return $personaInteresadaController->index($request);
});

$router->add('GET', '/api/v1/personas-interesadas/detail', function ($request) use ($personaInteresadaController) {
    return $personaInteresadaController->detail($request);
});

$router->add('PUT', '/api/v1/personas-interesadas', function ($request) use ($personaInteresadaController) {
    return $personaInteresadaController->update($request);
});

$router->add('DELETE', '/api/v1/personas-interesadas', function ($request) use ($personaInteresadaController) {
    return $personaInteresadaController->delete($request);
});

// ---------------------------------------------------------------------
// Auth tokens (consulta/revocacion administrativa)
// ---------------------------------------------------------------------
register_crud($router, '/api/v1/auth-tokens', 'AuthTokenController');

// ---------------------------------------------------------------------
// Configuracion del sitio (versionada)
// ---------------------------------------------------------------------
$siteConfigController = new SiteConfigController();

// Publica: retorna la configuracion activa
$router->add('GET', '/api/v1/site-config/active', function ($request) use ($siteConfigController) {
    return $siteConfigController->active($request);
});

// Administrativa: listar/versionar/activar/desactivar
$router->add('GET', '/api/v1/site-configs', function ($request) use ($siteConfigController) {
    return $siteConfigController->index($request);
});

$router->add('GET', '/api/v1/site-configs/detail', function ($request) use ($siteConfigController) {
    return $siteConfigController->detail($request);
});

$router->add('POST', '/api/v1/site-configs', function ($request) use ($siteConfigController) {
    return $siteConfigController->create($request);
});

$router->add('PUT', '/api/v1/site-configs', function ($request) use ($siteConfigController) {
    return $siteConfigController->update($request);
});

$router->add('DELETE', '/api/v1/site-configs', function ($request) use ($siteConfigController) {
    return $siteConfigController->delete($request);
});

$router->add('POST', '/api/v1/site-configs/activate', function ($request) use ($siteConfigController) {
    return $siteConfigController->activate($request);
});

$router->add('POST', '/api/v1/site-configs/deactivate', function ($request) use ($siteConfigController) {
    return $siteConfigController->deactivate($request);
});
