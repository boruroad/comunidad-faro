<?php

class PersonaRepository extends BaseRepository
{
    protected $table = 'personas';
    protected $fillable = array(
        'comunidad_id',
        'numero_control',
        'origen',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'fecha_nacimiento',
        'telefono',
        'whatsapp',
        'email',
        'direccion',
        'barrio',
        'seccion',
        'fecha_alta',
        'estatus',
        'como_se_entero',
        'medio_contacto_preferido',
        'observaciones'
    );

    // Campos que se buscan por coincidencia parcial (LIKE); el resto son igualdad exacta.
    private $likeFields = array(
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'numero_control',
        'telefono',
        'whatsapp',
        'email',
        'direccion',
        'barrio',
        'seccion',
        'como_se_entero',
        'observaciones'
    );

    public function search(array $filters, $limit = 100, $offset = 0)
    {
        $limit = max(1, (int) $limit);
        $offset = max(0, (int) $offset);

        $where = array();
        $types = '';
        $values = array();

        foreach ($filters as $field => $value) {
            if ($value === null || $value === '' || !in_array($field, $this->fillable, true)) {
                continue;
            }

            if (in_array($field, $this->likeFields, true)) {
                $where[] = $field . ' LIKE ?';
                $types .= 's';
                $values[] = '%' . $value . '%';
            } else {
                $where[] = $field . ' = ?';
                $types .= is_int($value) ? 'i' : 's';
                $values[] = $value;
            }
        }

        $sql = 'SELECT * FROM ' . $this->table;
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        $types .= 'ii';
        $values[] = $limit;
        $values[] = $offset;

        $stmt = $this->db->prepare($sql);
        $this->bindDynamic($stmt, $types, $values);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $rows ?: array();
    }
}
