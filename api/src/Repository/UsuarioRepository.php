<?php

class UsuarioRepository extends BaseRepository
{
    protected $table = 'usuarios';
    protected $fillable = array('comunidad_id', 'persona_id', 'rol_id', 'email', 'activo');

    // Sobrescribe BaseRepository::findById para nunca traer password_hash en detail/update/delete.
    public function findById($id)
    {
        $sql = 'SELECT id, comunidad_id, persona_id, rol_id, email, activo, ultimo_acceso, created_at, updated_at
            FROM usuarios WHERE id = ? LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ?: null;
    }

    public function findModelById($id)
    {
        $row = $this->findById($id);
        return $row ? new Usuario($row) : null;
    }

    public function findByEmail($email)
    {
        $sql = 'SELECT * FROM usuarios WHERE email = ? LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ? new Usuario($row) : null;
    }

    public function createWithPassword(array $data)
    {
        $activo = array_key_exists('activo', $data) ? (int) (bool) $data['activo'] : 1;
        $comunidadId = isset($data['comunidad_id']) ? $data['comunidad_id'] : null;
        $personaId = isset($data['persona_id']) ? $data['persona_id'] : null;

        $sql = 'INSERT INTO usuarios (comunidad_id, persona_id, rol_id, email, password_hash, activo)
            VALUES (?, ?, ?, ?, ?, ?)';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param(
            'iiissi',
            $comunidadId,
            $personaId,
            $data['rol_id'],
            $data['email'],
            $data['password_hash'],
            $activo
        );

        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();

        return $id;
    }

    public function setActivo($usuarioId, $activo)
    {
        $activo = (int) (bool) $activo;
        $sql = 'UPDATE usuarios SET activo = ? WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('ii', $activo, $usuarioId);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    public function updatePasswordHash($usuarioId, $newHash)
    {
        $sql = 'UPDATE usuarios SET password_hash = ? WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('si', $newHash, $usuarioId);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    public function touchLastAccess($usuarioId)
    {
        $sql = 'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $usuarioId);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }
}
