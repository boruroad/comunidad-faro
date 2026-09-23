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

        $nombre = trim((string) ($payload['nombre'] ?? ''));
        $apellidoPaterno = trim((string) ($payload['apellido_paterno'] ?? ''));
        $apellidoMaterno = trim((string) ($payload['apellido_materno'] ?? ''));
        $whatsapp = trim((string) ($payload['whatsapp'] ?? ''));
        $email = trim((string) ($payload['email'] ?? ''));
        $comoSeEntero = trim((string) ($payload['como_se_entero'] ?? ''));
        $medioContacto = strtoupper(trim((string) ($payload['medio_contacto_preferido'] ?? '')));
        $comentario = trim((string) ($payload['comentario'] ?? ''));
        $aceptoPrivacidad = $this->toBool($payload['acepto_privacidad'] ?? false);

        if ($nombre === '' || mb_strlen($nombre) > 100) {
            return $this->fail('nombre es requerido (maximo 100 caracteres)', 422);
        }

        if ($apellidoPaterno !== '' && mb_strlen($apellidoPaterno) > 100) {
            return $this->fail('apellido paterno debe tener maximo 100 caracteres', 422);
        }

        if ($apellidoMaterno !== '' && mb_strlen($apellidoMaterno) > 100) {
            return $this->fail('apellido materno debe tener maximo 100 caracteres', 422);
        }

        if ($whatsapp === '' || !preg_match('/^[0-9+()\s-]{7,30}$/', $whatsapp)) {
            return $this->fail('whatsapp es requerido y debe ser un numero valido', 422);
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->fail('email no tiene un formato valido', 422);
        }

        if ($comoSeEntero === '' || mb_strlen($comoSeEntero) > 150) {
            return $this->fail('como_se_entero es requerido (maximo 150 caracteres)', 422);
        }

        if (!in_array($medioContacto, $this->medioContactoValidos, true)) {
            return $this->fail('medio_contacto_preferido debe ser WHATSAPP, LLAMADA o EMAIL', 422);
        }

        if ($comentario !== '' && mb_strlen($comentario) > 2000) {
            return $this->fail('comentario debe tener maximo 2000 caracteres', 422);
        }

        if (!$aceptoPrivacidad) {
            return $this->fail('debes aceptar la politica de privacidad para continuar', 422);
        }

        $id = $this->repo->create(array(
            'origen' => 'INTERESADO',
            'nombre' => $nombre,
            'apellido_paterno' => $apellidoPaterno !== '' ? $apellidoPaterno : null,
            'apellido_materno' => $apellidoMaterno !== '' ? $apellidoMaterno : null,
            'whatsapp' => $whatsapp,
            'email' => $email !== '' ? $email : null,
            'como_se_entero' => $comoSeEntero,
            'medio_contacto_preferido' => $medioContacto,
            'observaciones' => $comentario !== '' ? $comentario : null,
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
            'items' => camelize_keys($rows),
        ), 'personas interesadas list');
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

        $row = $this->findInteresadaOrNull($id);
        if (!$row) {
            return $this->fail('persona interesada not found', 404);
        }

        return $this->ok(array(
            'item' => camelize_keys($row),
        ), 'persona interesada found');
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

        if (!$this->findInteresadaOrNull($id)) {
            return $this->fail('persona interesada not found', 404);
        }

        $payload = $this->extractPayload($request);
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

        if (empty($fields)) {
            return $this->fail('payload is required', 422);
        }

        $ok = $this->repo->updateById($id, $fields);
        if (!$ok) {
            return $this->fail('persona interesada could not be updated', 409);
        }

        $updated = $this->repo->findById($id);

        return $this->ok(array(
            'item' => camelize_keys($updated),
        ), 'persona interesada updated');
    }

    // Permite atender el derecho de cancelacion/oposicion sobre estos datos.
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

        if (!$this->findInteresadaOrNull($id)) {
            return $this->fail('persona interesada not found', 404);
        }

        $ok = $this->repo->deleteById($id);
        if (!$ok) {
            return $this->fail('persona interesada could not be deleted', 409);
        }

        return $this->ok(array(), 'persona interesada deleted');
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
            $field = strpos($key, '_') !== false ? $key : camel_to_snake((string) $key);
            $payload[$field] = $value;
        }

        return $payload;
    }
}
