<?php

class CasaController extends CrudController
{
    protected $resourceLabel = 'casa';
    protected $allowedFields = array('comunidad_id', 'nombre', 'direccion', 'latitud', 'longitud');
    protected $filterableFields = array('comunidad_id');
    protected $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD');

    public function __construct()
    {
        $this->repo = new CasaRepository();
    }

    public function create($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }
        if (!$this->hasAnyRole($usuario, $this->writeRoles)) {
            return $this->fail('insufficient permissions', 403);
        }

        $payload = $this->extractPayload($request);
        $comunidadId = isset($payload['comunidad_id']) ? (int) $payload['comunidad_id'] : 0;
        $nombre = isset($payload['nombre']) ? trim((string) $payload['nombre']) : '';
        $direccion = isset($payload['direccion']) ? trim((string) $payload['direccion']) : '';

        if ($comunidadId <= 0 || $nombre === '' || $direccion === '') {
            return $this->fail('comunidad_id, nombre and direccion are required', 422);
        }

        $id = $this->repo->create($payload);
        if ($id <= 0) {
            return $this->fail('casa could not be created', 409);
        }

        return $this->ok(array(
            'item' => $this->camelize($this->repo->findById($id)),
        ), 'casa created');
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
            return $this->fail('casa not found', 404);
        }

        if ($this->repo->hasDependents($id)) {
            return $this->fail('no se puede eliminar: existen personas asignadas a esta casa', 409);
        }

        $ok = $this->repo->deleteById($id);
        if (!$ok) {
            return $this->fail('casa could not be deleted', 409);
        }

        return $this->ok(array(), 'casa deleted');
    }
}
