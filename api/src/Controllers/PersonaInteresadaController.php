<?php

class PersonaInteresadaController extends BaseController
{
    private $repo;
    private $adminRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD');
    private $medioContactoValidos = array('WHATSAPP', 'LLAMADA', 'EMAIL');
    private $estatusValidos = array('NUEVO', 'CONTACTADO', 'DESCARTADO');

    public function __construct()
    {
        $this->repo = new PersonaInteresadaRepository();
    }

    // Endpoint publico: sin autenticacion, solo requiere consentimiento explicito.
    public function register($request)
    {
        $payload = $this->extractPayload($request);
        $fields = $this->buildRegistroFields($payload);

        $validationError = $this->validateRegistro($fields);
        if ($validationError) {
            return $this->fail($validationError, 422);
        }

        return $this->persistRegistro($fields);
    }

    private function buildRegistroFields($payload)
    {
        return array(
            'nombre' => trim((string) ($payload['nombre'] ?? '')),
            'apellido_paterno' => trim((string) ($payload['apellido_paterno'] ?? '')),
            'apellido_materno' => trim((string) ($payload['apellido_materno'] ?? '')),
            'whatsapp' => trim((string) ($payload['whatsapp'] ?? '')),
            'email' => trim((string) ($payload['email'] ?? '')),
            'como_se_entero' => trim((string) ($payload['como_se_entero'] ?? '')),
            'medio_contacto_preferido' => strtoupper(trim((string) ($payload['medio_contacto_preferido'] ?? ''))),
            'comentario' => trim((string) ($payload['comentario'] ?? '')),
            'acepto_privacidad' => $this->toBool($payload['acepto_privacidad'] ?? false),
        );
    }

    // Primer chequeo que falle gana; mismo orden y mensajes que la validacion original.
    private function validateRegistro($fields)
    {
        $checks = array(
            array($fields['nombre'] === '' || mb_strlen($fields['nombre']) > 100, 'nombre es requerido (maximo 100 caracteres)'),
            array($fields['apellido_paterno'] !== '' && mb_strlen($fields['apellido_paterno']) > 100, 'apellido paterno debe tener maximo 100 caracteres'),
            array($fields['apellido_materno'] !== '' && mb_strlen($fields['apellido_materno']) > 100, 'apellido materno debe tener maximo 100 caracteres'),
            array($fields['whatsapp'] === '' || !preg_match('/^[0-9+()\s-]{7,30}$/', $fields['whatsapp']), 'whatsapp es requerido y debe ser un numero valido'),
            array($fields['email'] !== '' && !filter_var($fields['email'], FILTER_VALIDATE_EMAIL), 'email no tiene un formato valido'),
            array($fields['como_se_entero'] === '' || mb_strlen($fields['como_se_entero']) > 150, 'como_se_entero es requerido (maximo 150 caracteres)'),
            array(!in_array($fields['medio_contacto_preferido'], $this->medioContactoValidos, true), 'medio_contacto_preferido debe ser WHATSAPP, LLAMADA o EMAIL'),
            array($fields['comentario'] !== '' && mb_strlen($fields['comentario']) > 2000, 'comentario debe tener maximo 2000 caracteres'),
            array(!$fields['acepto_privacidad'], 'debes aceptar la politica de privacidad para continuar'),
        );

        foreach ($checks as $check) {
            if ($check[0]) {
                return $check[1];
            }
        }

        return null;
    }

    private function persistRegistro($fields)
    {
        $id = $this->repo->create(array(
            'origen' => 'INTERESADO',
            'nombre' => $fields['nombre'],
            'apellido_paterno' => $fields['apellido_paterno'] !== '' ? $fields['apellido_paterno'] : null,
            'apellido_materno' => $fields['apellido_materno'] !== '' ? $fields['apellido_materno'] : null,
            'whatsapp' => $fields['whatsapp'],
            'email' => $fields['email'] !== '' ? $fields['email'] : null,
            'como_se_entero' => $fields['como_se_entero'],
            'medio_contacto_preferido' => $fields['medio_contacto_preferido'],
            'observaciones' => $fields['comentario'] !== '' ? $fields['comentario'] : null,
            'estatus' => 'NUEVO',
            'acepto_privacidad' => 1,
            'acepto_privacidad_at' => date('Y-m-d H:i:s'),
        ));

        if ($id <= 0) {
            return $this->fail('no se pudo registrar tu informacion, intenta de nuevo', 409);
        }

        return $this->ok(array(
            'registered' => true,
        ), 'gracias por tu interes, pronto nos pondremos en contacto');
    }

    public function index($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $limit = isset($request['limit']) ? (int) $request['limit'] : 100;
        $offset = isset($request['offset']) ? (int) $request['offset'] : 0;

        // Siempre acotado a leads (origen=INTERESADO); nunca mezcla miembros formales.
        $conditions = array('origen' => 'INTERESADO');
        if (isset($request['estatus']) && $request['estatus'] !== '') {
            $conditions['estatus'] = strtoupper((string) $request['estatus']);
        }

        $rows = $this->repo->findAllBy($conditions, $limit, $offset);

        return $this->ok(array(
            'items' => camelizeKeys($rows),
        ), 'personas interesadas list');
    }

    public function detail($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $target = $this->resolveInteresadaTarget($request);
        if ($this->isFailResponse($target)) {
            return $target;
        }

        return $this->ok(array(
            'item' => camelizeKeys($target),
        ), 'persona interesada found');
    }

    public function update($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $target = $this->resolveInteresadaTarget($request);
        if ($this->isFailResponse($target)) {
            return $target;
        }

        return $this->applyInteresadaUpdate((int) $target['id'], $request);
    }

    private function applyInteresadaUpdate($id, $request)
    {
        $payload = $this->extractPayload($request);
        $fields = $this->buildInteresadaUpdateFields($payload);
        if ($this->isFailResponse($fields)) {
            return $fields;
        }

        if (empty($fields)) {
            return $this->fail('payload is required', 422);
        }

        return $this->persistInteresadaUpdate($id, $fields);
    }

    private function buildInteresadaUpdateFields($payload)
    {
        $fields = array();

        if (isset($payload['estatus'])) {
            $estatus = strtoupper(trim((string) $payload['estatus']));
            if (!in_array($estatus, $this->estatusValidos, true)) {
                return $this->fail('estatus debe ser NUEVO, CONTACTADO o DESCARTADO', 422);
            }
            $fields['estatus'] = $estatus;
        }

        if (array_key_exists('observaciones', $payload)) {
            $fields['observaciones'] = trim((string) $payload['observaciones']);
        }

        return $fields;
    }

    private function persistInteresadaUpdate($id, $fields)
    {
        $ok = $this->repo->updateById($id, $fields);
        if (!$ok) {
            return $this->fail('persona interesada could not be updated', 409);
        }

        $updated = $this->repo->findById($id);

        return $this->ok(array(
            'item' => camelizeKeys($updated),
        ), 'persona interesada updated');
    }

    // Permite atender el derecho de cancelacion/oposicion sobre estos datos.
    public function delete($request)
    {
        $usuario = $this->requireAdminUser();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $target = $this->resolveInteresadaTarget($request);
        if ($this->isFailResponse($target)) {
            return $target;
        }

        return $this->persistInteresadaDelete((int) $target['id']);
    }

    private function persistInteresadaDelete($id)
    {
        $ok = $this->repo->deleteById($id);
        if (!$ok) {
            return $this->fail('persona interesada could not be deleted', 409);
        }

        return $this->ok(array(), 'persona interesada deleted');
    }

    // Valida el id de la URL y que exista como lead (origen=INTERESADO); comparte logica entre detail()/update()/delete().
    private function resolveInteresadaTarget($request)
    {
        $id = isset($request['id']) ? (int) $request['id'] : 0;
        if ($id <= 0) {
            return $this->fail('id is required', 422);
        }

        $row = $this->findInteresadaOrNull($id);

        return $row ? $row : $this->fail('persona interesada not found', 404);
    }

    private function isFailResponse($result)
    {
        return is_array($result) && isset($result['success']) && $result['success'] === false;
    }

    // Evita operar sobre un registro que en realidad es un miembro formal (origen=MIEMBRO).
    private function findInteresadaOrNull($id)
    {
        $row = $this->repo->findById($id);
        if (!$row || ($row['origen'] ?? '') !== 'INTERESADO') {
            return null;
        }

        return $row;
    }

    private function requireAdminUser()
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return null;
        }

        if (!$this->hasAnyRole($usuario, $this->adminRoles)) {
            return null;
        }

        return $usuario;
    }

    private function toBool($value)
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        $normalized = strtolower(trim((string) $value));
        return in_array($normalized, array('1', 'true', 'si', 'yes', 'on'), true);
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

        $payload = array();
        foreach ((array) $source as $key => $value) {
            $field = strpos($key, '_') !== false ? $key : camelToSnake((string) $key);
            $payload[$field] = $value;
        }

        return $payload;
    }
}
