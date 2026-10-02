<?php

class UsuarioController extends CrudController
{
    private const ID_REQUIRED_MESSAGE = 'id is required';

    protected $resourceLabel = 'usuario';
    protected $allowedFields = array('comunidad_id', 'persona_id', 'rol_id', 'email', 'activo');
    protected $filterableFields = array('comunidad_id', 'rol_id', 'activo');
    protected $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD');

    private $authService;
    private $roles;
    private $comunidades;
    private $personas;
    private $accessGuard;
    private $requestValidator;

    public function __construct()
    {
        $this->repo = new UsuarioRepository();
        $this->authService = new AuthService();
        $this->roles = new RolRepository();
        $this->comunidades = new ComunidadRepository();
        $this->personas = new PersonaRepository();
        $this->accessGuard = new UsuarioAccessGuard($this->authService, $this->roles, $this->repo);
        $this->requestValidator = new UsuarioRequestValidator($this->roles, $this->repo);
    }

    public function index($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $limit = isset($request['limit']) ? (int) $request['limit'] : 100;
        $offset = isset($request['offset']) ? (int) $request['offset'] : 0;

        $conditions = array();
        foreach ($this->filterableFields as $field) {
            if (isset($request[$field]) && $request[$field] !== '') {
                $conditions[$field] = is_numeric($request[$field]) ? (int) $request[$field] : $request[$field];
            }
        }

        $rows = empty($conditions)
            ? $this->repo->findAll($limit, $offset)
            : $this->repo->findAllBy($conditions, $limit, $offset);

        $rows = $this->accessGuard->visibleRows($usuario, $rows);
        $rows = $this->enrichRows($rows);

        return $this->ok(array(
            'items' => $this->camelize($rows),
        ), $this->resourceLabel . ' list');
    }

    public function detail($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail(self::ID_REQUIRED_MESSAGE, 422);
        }

        return $this->buildDetailResponse($usuario, $id);
    }

    private function buildDetailResponse($usuario, $id)
    {
        $row = $this->accessGuard->findVisibleTarget($usuario, $id);
        if (!$row) {
            return $this->fail($this->resourceLabel . ' not found', 404);
        }

        $enriched = $this->enrichRows(array($row));

        return $this->ok(array(
            'item' => $this->camelize($enriched[0]),
        ), $this->resourceLabel . ' found');
    }

    // Nunca debe salir password_hash por la API; de paso se agrega el nombre del rol/comunidad/persona para la UI.
    private function enrichRows(array $rows)
    {
        return array_map(function ($row) {
            unset($row['password_hash']);

            $rol = $this->roles->findById((int) $row['rol_id']);
            $row['rol_nombre'] = $rol ? $rol['nombre'] : null;

            $row['comunidad_nombre'] = null;
            if (!empty($row['comunidad_id'])) {
                $comunidad = $this->comunidades->findById((int) $row['comunidad_id']);
                $row['comunidad_nombre'] = $comunidad ? $comunidad['nombre'] : null;
            }

            $row['persona_nombre'] = null;
            if (!empty($row['persona_id'])) {
                $persona = $this->personas->findById((int) $row['persona_id']);
                $row['persona_nombre'] = $persona ? trim($persona['nombre'] . ' ' . $persona['apellido_paterno']) : null;
            }

            return $row;
        }, $rows);
    }

    // Un ADMIN_COMUNIDAD (u otro rol no SUPERADMIN) no debe ver cuentas de SUPERADMIN.
    // -> ver UsuarioAccessGuard::visibleRows()

    // Login valido pero sin permisos de escritura -> array de fail(); exito -> objeto Usuario.
    private function requireWriteAuth()
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        return $this->accessGuard->hasWriteAccess($usuario, $this->writeRoles) ? $usuario : $this->fail('insufficient permissions', 403);
    }

    private function isFailResponse($result)
    {
        return is_array($result) && isset($result['success']) && $result['success'] === false;
    }

    // Valida el id de la URL y que el usuario objetivo exista/sea visible; comparte logica entre update() y setActivoConGuardas().
    private function resolveTargetUsuario($usuario, $request)
    {
        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail(self::ID_REQUIRED_MESSAGE, 422);
        }

        $target = $this->accessGuard->findVisibleTarget($usuario, $id);
        if (!$target) {
            return $this->fail('usuario not found', 404);
        }

        return $target;
    }

    public function create($request)
    {
        $usuario = $this->requireWriteAuth();
        if ($this->isFailResponse($usuario)) {
            return $usuario;
        }

        return $this->createUsuarioFromRequest($request);
    }

    private function createUsuarioFromRequest($request)
    {
        $payload = $this->extractPayload($request);
        $email = isset($payload['email']) ? strtolower(trim((string) $payload['email'])) : '';
        $password = isset($request['password']) ? (string) $request['password'] : '';
        $comunidadId = isset($payload['comunidad_id']) ? (int) $payload['comunidad_id'] : 0;
        $rolId = isset($payload['rol_id']) ? (int) $payload['rol_id'] : 0;

        $validationError = $this->requestValidator->validateCreateInput($email, $password, $comunidadId, $rolId);
        if ($validationError) {
            return $this->fail($validationError['message'], $validationError['code']);
        }

        $createdUser = $this->authService->createUsuario(array(
            'comunidad_id' => $comunidadId,
            'persona_id' => isset($payload['persona_id']) ? $payload['persona_id'] : null,
            'rol_id' => $rolId,
            'email' => $email,
            'password' => $password,
        ));

        if (!$createdUser) {
            return $this->fail('email already exists, or comunidad_id/rol_id/persona_id is invalid', 409);
        }

        return $this->ok(array(
            'item' => $this->camelize($createdUser->toArray()),
        ), 'usuario created');
    }

    public function update($request)
    {
        $usuario = $this->requireWriteAuth();
        if ($this->isFailResponse($usuario)) {
            return $usuario;
        }

        $target = $this->resolveTargetUsuario($usuario, $request);
        if ($this->isFailResponse($target)) {
            return $target;
        }

        return $this->applyUsuarioUpdate((int) $target['id'], $request);
    }

    private function applyUsuarioUpdate($id, $request)
    {
        $payload = $this->extractPayload($request);
        $fields = $this->requestValidator->buildUpdateFields($id, $payload);
        if ($this->requestValidator->isError($fields)) {
            return $this->fail($fields['message'], $fields['code']);
        }

        $newPassword = isset($request['password']) ? (string) $request['password'] : '';
        $validationError = $this->requestValidator->validatePasswordAndPresence($fields, $newPassword);
        if ($validationError) {
            return $this->fail($validationError['message'], $validationError['code']);
        }

        return $this->persistUsuarioUpdate($id, $fields, $newPassword);
    }

    private function persistUsuarioUpdate($id, $fields, $newPassword)
    {
        if ($newPassword !== '') {
            $this->authService->updatePassword($id, $newPassword);
        }

        if (!empty($fields)) {
            $ok = $this->repo->updateById($id, $fields);
            if (!$ok) {
                return $this->fail('usuario could not be updated', 409);
            }
        }

        $updated = $this->repo->findById($id);
        $enriched = $this->enrichRows(array($updated));

        return $this->ok(array(
            'item' => $this->camelize($enriched[0]),
        ), 'usuario updated');
    }

    public function profile($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        return $this->ok(array(
            'user' => $usuario->toArray(),
            'role' => $this->authService->roleForUsuario($usuario),
            'persona' => $this->authService->personaForUsuario($usuario),
        ), 'profile found');
    }

    // Alta de cuentas de autoregistro (email/password) pendientes de aprobacion.
    public function activate($request)
    {
        return $this->setActivoConGuardas($request, true, 'usuario activated');
    }

    // Ademas de desactivar, revoca cualquier sesion activa de esa cuenta.
    public function deactivate($request)
    {
        $result = $this->setActivoConGuardas($request, false, 'usuario deactivated');

        if (!empty($result['success'])) {
            $id = isset($request['id']) ? (int) $request['id'] : 0;
            (new AuthTokenRepository())->revokeAllForUsuario($id);
        }

        return $result;
    }

    private function setActivoConGuardas($request, $activo, $successMessage)
    {
        $usuario = $this->requireWriteAuth();
        if ($this->isFailResponse($usuario)) {
            return $usuario;
        }

        $target = $this->resolveTargetUsuario($usuario, $request);
        if ($this->isFailResponse($target)) {
            return $target;
        }

        return $this->persistActivoChange((int) $target['id'], $activo, $successMessage);
    }

    private function persistActivoChange($id, $activo, $successMessage)
    {
        $ok = $this->repo->setActivo($id, $activo);
        if (!$ok) {
            return $this->fail('usuario could not be updated', 409);
        }

        $updated = $this->repo->findById($id);
        $enriched = $this->enrichRows(array($updated));

        return $this->ok(array(
            'item' => $this->camelize($enriched[0]),
        ), $successMessage);
    }
}
