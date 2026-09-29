<?php

// Validaciones de payload para alta/edicion de usuarios, sin dependencia de HTTP (fail()/ok()).
// Los metodos devuelven null/valor cuando todo es valido, o array('message' => .., 'code' => ..) si hay error.
class UsuarioRequestValidator
{
    private const WEAK_PASSWORD_MESSAGE = 'password must be at least 12 chars and include uppercase, lowercase, number, special char, and no spaces';

    private $roles;
    private $usuarios;

    public function __construct(RolRepository $roles, UsuarioRepository $usuarios)
    {
        $this->roles = $roles;
        $this->usuarios = $usuarios;
    }

    public function validateCreateInput($email, $password, $comunidadId, $rolId)
    {
        if ($email === '' || $password === '' || $comunidadId <= 0 || $rolId <= 0) {
            return $this->error('email, password, comunidad_id and rol_id are required', 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error('email format is invalid', 422);
        }

        return $this->isStrongPassword($password) ? null : $this->error(self::WEAK_PASSWORD_MESSAGE, 422);
    }

    // Error, o el array de campos (posiblemente vacio) listo para UsuarioRepository::updateById().
    public function buildUpdateFields($id, $payload)
    {
        $emailResult = $this->resolveEmailUpdate($id, $payload);
        if ($this->isError($emailResult)) {
            return $emailResult;
        }

        $rolResult = $this->resolveRolUpdate($payload);
        if ($this->isError($rolResult)) {
            return $rolResult;
        }

        $fields = array();
        if ($emailResult !== null) {
            $fields['email'] = $emailResult;
        }
        if ($rolResult !== null) {
            $fields['rol_id'] = $rolResult;
        }
        if (array_key_exists('comunidad_id', $payload)) {
            $fields['comunidad_id'] = $payload['comunidad_id'] ? (int) $payload['comunidad_id'] : null;
        }
        if (array_key_exists('persona_id', $payload)) {
            $fields['persona_id'] = $payload['persona_id'] ? (int) $payload['persona_id'] : null;
        }
        if (array_key_exists('activo', $payload)) {
            $fields['activo'] = (bool) $payload['activo'];
        }

        return $fields;
    }

    public function validatePasswordAndPresence($fields, $newPassword)
    {
        if ($newPassword !== '' && !$this->isStrongPassword($newPassword)) {
            return $this->error(self::WEAK_PASSWORD_MESSAGE, 422);
        }

        return (empty($fields) && $newPassword === '') ? $this->error('payload is required', 422) : null;
    }

    public function isStrongPassword($password)
    {
        if (!is_string($password) || strlen($password) < 12) {
            return false;
        }

        if (preg_match('/\s/', $password)) {
            return false;
        }

        return preg_match('/[A-Z]/', $password)
            && preg_match('/[a-z]/', $password)
            && preg_match('/\d/', $password)
            && preg_match('/[^A-Za-z0-9]/', $password);
    }

    public function isError($result)
    {
        return is_array($result) && array_key_exists('message', $result) && array_key_exists('code', $result);
    }

    private function error($message, $code)
    {
        return array('message' => $message, 'code' => $code);
    }

    private function resolveEmailUpdate($id, $payload)
    {
        if (!isset($payload['email'])) {
            return null;
        }

        $email = strtolower(trim((string) $payload['email']));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error('email format is invalid', 422);
        }

        $existing = $this->usuarios->findByEmail($email);

        return ($existing && (int) $existing->id !== $id) ? $this->error('email already exists', 409) : $email;
    }

    private function resolveRolUpdate($payload)
    {
        if (!isset($payload['rol_id'])) {
            return null;
        }

        $rolId = (int) $payload['rol_id'];

        return ($rolId <= 0 || !$this->roles->findById($rolId)) ? $this->error('rol_id is invalid', 422) : $rolId;
    }
}
