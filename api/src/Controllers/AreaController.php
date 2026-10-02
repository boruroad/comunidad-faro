<?php

class AreaController extends CrudController
{
    protected $resourceLabel = 'area';
    protected $allowedFields = array('nombre', 'descripcion');
    protected $filterableFields = array('nombre');
    protected $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD');

    public function __construct()
    {
        $this->repo = new AreaRepository();
    }

    // Sobrescribe el delete generico para no reventar con un error de FK.
    public function delete($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        if (!$this->hasAnyRole($usuario, $this->writeRoles)) {
            return $this->fail('insufficient permissions', 403);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        if (!$this->repo->findById($id)) {
            return $this->fail('area not found', 404);
        }

        if ($this->repo->hasDependents($id)) {
            return $this->fail('no se puede eliminar: existen personas asignadas a esta area', 409);
        }

        $ok = $this->repo->deleteById($id);
        if (!$ok) {
            return $this->fail('area could not be deleted', 409);
        }

        return $this->ok(array(), 'area deleted');
    }
}
