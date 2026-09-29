<?php

// Reglas de visibilidad/permisos de escritura sobre usuarios, separadas de UsuarioController
// para no superar el limite de metodos por clase.
class UsuarioAccessGuard
{
    private $authService;
    private $roles;
    private $usuarios;

    public function __construct(AuthService $authService, RolRepository $roles, UsuarioRepository $usuarios)
    {
        $this->authService = $authService;
        $this->roles = $roles;
        $this->usuarios = $usuarios;
    }

    public function hasWriteAccess($usuario, array $writeRoles)
    {
        if (!$usuario || empty($writeRoles)) {
            return empty($writeRoles);
        }

        return $this->authService->userHasAnyRole((int) $usuario->id, $writeRoles);
    }

    // Un ADMIN_COMUNIDAD (u otro rol no SUPERADMIN) no debe ver cuentas de SUPERADMIN.
    public function visibleRows($usuario, array $rows)
    {
        $role = $this->authService->roleForUsuario($usuario);
        if ($role && $role['nombre'] === 'SUPERADMIN') {
            return $rows;
        }

        $superadminRol = $this->roles->findByNombre('SUPERADMIN');
        $superadminRolId = $superadminRol ? (int) $superadminRol['id'] : 0;

        return array_values(array_filter($rows, function ($row) use ($superadminRolId) {
            return (int) $row['rol_id'] !== $superadminRolId;
        }));
    }

    // Fila objetivo si existe y es visible para $usuario; null en caso contrario.
    public function findVisibleTarget($usuario, $id)
    {
        $target = $this->usuarios->findById($id);
        if (!$target || empty($this->visibleRows($usuario, array($target)))) {
            return null;
        }

        return $target;
    }
}
