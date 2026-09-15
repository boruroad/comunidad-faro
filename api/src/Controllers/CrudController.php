<?php

class CrudController extends BaseController
{
    protected $repo;
    protected $resourceLabel = 'resource';
    protected $allowedFields = array();
    protected $filterableFields = array();
    protected $writeRoles = array();

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
            return $this->fail('id is required', 422);
        }

        $row = $this->repo->findById($id);
        if (!$row) {
            return $this->fail($this->resourceLabel . ' not found', 404);
        }

        return $this->ok(array(
            'item' => $this->camelize($row),
        ), $this->resourceLabel . ' found');
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
        if (empty($payload)) {
            return $this->fail('payload is required', 422);
        }

        $id = $this->repo->create($payload);
        if ($id <= 0) {
            return $this->fail($this->resourceLabel . ' could not be created', 409);
        }

        $created = $this->repo->findById($id);

        return $this->ok(array(
            'item' => $this->camelize($created),
        ), $this->resourceLabel . ' created');
    }

    public function update($request)
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

        $payload = $this->extractPayload($request);
        if (empty($payload)) {
            return $this->fail('payload is required', 422);
        }

        if (!$this->repo->findById($id)) {
            return $this->fail($this->resourceLabel . ' not found', 404);
        }

        $ok = $this->repo->updateById($id, $payload);
        if (!$ok) {
            return $this->fail($this->resourceLabel . ' could not be updated', 409);
        }

        $updated = $this->repo->findById($id);

        return $this->ok(array(
            'item' => $this->camelize($updated),
        ), $this->resourceLabel . ' updated');
    }

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
            return $this->fail($this->resourceLabel . ' not found', 404);
        }

        $ok = $this->repo->deleteById($id);
        if (!$ok) {
            return $this->fail($this->resourceLabel . ' could not be deleted', 409);
        }

        return $this->ok(array(), $this->resourceLabel . ' deleted');
    }

    protected function extractPayload($request)
    {
        $source = $request;

        if (isset($request['payload'])) {
            if (is_array($request['payload'])) {
                $source = $request['payload'];
            } elseif (is_string($request['payload'])) {
                $decoded = json_decode($request['payload'], true);
                if (is_array($decoded)) {
                    $source = $decoded;
                }
            }
        }

        $payload = array();

        foreach ((array) $source as $key => $value) {
            $field = strpos($key, '_') !== false ? $key : camel_to_snake((string) $key);

            if (!empty($this->allowedFields) && !in_array($field, $this->allowedFields, true)) {
                continue;
            }

            if ($field === 'id' || $field === 'token' || $field === 'limit' || $field === 'offset') {
                continue;
            }

            $payload[$field] = $value;
        }

        return $payload;
    }

    protected function camelize($value)
    {
        return camelize_keys($value);
    }
}
