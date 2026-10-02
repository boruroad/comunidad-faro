<?php

class SiteConfigController extends BaseController
{
    private $repo;
    private $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD');

    public function __construct()
    {
        $this->repo = new SiteConfigRepository();
    }

    public function active($request)
    {
        $row = $this->repo->findActive();
        if (!$row) {
            return $this->fail('active site config not found', 404);
        }

        return $this->ok(array(
            'config' => $this->decodeConfigJson($row['config_json']),
            'version' => array(
                'id' => (int) $row['id'],
                'nombre' => (string) $row['nombre'],
                'descripcion' => (string) ($row['descripcion'] ?? ''),
                'updatedAt' => $row['updated_at'],
                'activatedAt' => $row['activated_at'],
            ),
        ), 'active site config');
    }

    public function index($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $limit = isset($request['limit']) ? (int) $request['limit'] : 100;
        $offset = isset($request['offset']) ? (int) $request['offset'] : 0;

        $rows = $this->repo->findAllWithMeta($limit, $offset);
        $items = array_map(function ($row) {
            return $this->mapRowToItem($row);
        }, $rows);

        return $this->ok(array(
            'items' => $items,
        ), 'site config list');
    }

    public function detail($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        $row = $this->repo->findByIdWithMeta($id);
        if (!$row) {
            return $this->fail('site config not found', 404);
        }

        return $this->ok(array(
            'item' => $this->mapRowToItem($row),
        ), 'site config found');
    }

    public function create($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $payload = $this->extractPayload($request);

        $nombre = trim((string) ($payload['nombre'] ?? ''));
        $descripcion = trim((string) ($payload['descripcion'] ?? ''));
        $activate = (bool) ($payload['activate'] ?? false);

        if ($nombre === '') {
            return $this->fail('nombre is required', 422);
        }

        $config = $this->readConfig($payload);
        if ($config === null) {
            return $this->fail('config must be a valid JSON object', 422);
        }

        $id = $this->repo->createVersion(
            $nombre,
            $descripcion,
            json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            (int) $usuario->id,
            $activate
        );

        if ($id <= 0) {
            return $this->fail('site config could not be created', 409);
        }

        $created = $this->repo->findByIdWithMeta($id);

        return $this->ok(array(
            'item' => $this->mapRowToItem($created),
        ), 'site config created');
    }

    public function update($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        $existing = $this->repo->findByIdWithMeta($id);
        if (!$existing) {
            return $this->fail('site config not found', 404);
        }

        $payload = $this->extractPayload($request);

        $fields = array();
        if (isset($payload['nombre'])) {
            $nombre = trim((string) $payload['nombre']);
            if ($nombre === '') {
                return $this->fail('nombre cannot be empty', 422);
            }
            $fields['nombre'] = $nombre;
        }

        if (array_key_exists('descripcion', $payload)) {
            $fields['descripcion'] = trim((string) $payload['descripcion']);
        }

        $config = $this->readConfig($payload);
        if ($config !== null) {
            $fields['config_json'] = json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } elseif (isset($payload['config']) || isset($payload['config_json']) || isset($payload['configJson'])) {
            return $this->fail('config must be a valid JSON object', 422);
        }

        if (empty($fields)) {
            return $this->fail('payload is required', 422);
        }

        $ok = $this->repo->updateVersion($id, $fields);
        if (!$ok) {
            return $this->fail('site config could not be updated', 409);
        }

        $updated = $this->repo->findByIdWithMeta($id);

        return $this->ok(array(
            'item' => $this->mapRowToItem($updated),
        ), 'site config updated');
    }

    public function delete($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        $row = $this->repo->findByIdWithMeta($id);
        if (!$row) {
            return $this->fail('site config not found', 404);
        }

        if (!empty($row['activo'])) {
            return $this->fail('active site config cannot be deleted', 409);
        }

        $ok = $this->repo->deleteById($id);
        if (!$ok) {
            return $this->fail('site config could not be deleted', 409);
        }

        return $this->ok(array(), 'site config deleted');
    }

    public function activate($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        if (!$this->repo->findByIdWithMeta($id)) {
            return $this->fail('site config not found', 404);
        }

        $ok = $this->repo->activateVersion($id, (int) $usuario->id);
        if (!$ok) {
            return $this->fail('site config could not be activated', 409);
        }

        $active = $this->repo->findByIdWithMeta($id);

        return $this->ok(array(
            'item' => $this->mapRowToItem($active),
        ), 'site config activated');
    }

    public function deactivate($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        if (!$this->repo->findByIdWithMeta($id)) {
            return $this->fail('site config not found', 404);
        }

        $ok = $this->repo->deactivateVersion($id, (int) $usuario->id);
        if (!$ok) {
            return $this->fail('site config could not be deactivated', 409);
        }

        $item = $this->repo->findByIdWithMeta($id);

        return $this->ok(array(
            'item' => $this->mapRowToItem($item),
        ), 'site config deactivated');
    }

    private function requireAdminUser()
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return null;
        }

        if (!$this->hasAnyRole($usuario, $this->writeRoles)) {
            return null;
        }

        return $usuario;
    }

    private function extractPayload($request)
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

        return (array) $source;
    }

    private function readConfig(array $payload)
    {
        if (isset($payload['config']) && is_array($payload['config'])) {
            return $payload['config'];
        }

        if (isset($payload['config_json']) && is_string($payload['config_json'])) {
            return $this->decodeObjectOrNull($payload['config_json']);
        }

        if (isset($payload['configJson']) && is_string($payload['configJson'])) {
            return $this->decodeObjectOrNull($payload['configJson']);
        }

        return null;
    }

    private function decodeObjectOrNull($json)
    {
        $decoded = json_decode((string) $json, true);
        if (!is_array($decoded)) {
            return null;
        }

        return $decoded;
    }

    private function decodeConfigJson($json)
    {
        $decoded = json_decode((string) $json, true);
        return is_array($decoded) ? $decoded : array();
    }

    private function mapRowToItem($row)
    {
        return array(
            'id' => (int) $row['id'],
            'nombre' => (string) $row['nombre'],
            'descripcion' => (string) ($row['descripcion'] ?? ''),
            'activo' => (bool) $row['activo'],
            'config' => $this->decodeConfigJson($row['config_json']),
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
            'activatedAt' => $row['activated_at'],
            'deactivatedAt' => $row['deactivated_at'],
            'createdByUsuarioId' => isset($row['created_by_usuario_id']) ? (int) $row['created_by_usuario_id'] : null,
            'activatedByUsuarioId' => isset($row['activated_by_usuario_id']) ? (int) $row['activated_by_usuario_id'] : null,
            'deactivatedByUsuarioId' => isset($row['deactivated_by_usuario_id']) ? (int) $row['deactivated_by_usuario_id'] : null,
            'createdByEmail' => $row['created_by_email'] ?? null,
            'activatedByEmail' => $row['activated_by_email'] ?? null,
            'deactivatedByEmail' => $row['deactivated_by_email'] ?? null,
        );
    }
}
