<?php

class PersonaRepository extends BaseRepository
{
    protected $table = 'personas';
    protected $fillable = array(
        'comunidad_id',
        'casa_id',
        'lider_id',
        'area_id',
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
        'asiste_reunion_general',
        'asiste_casa',
        'es_lider',
        'es_servidor',
        'registrado_por_usuario_id',
        'observaciones'
    );

    // fecha_alta documenta cuando se da de alta el registro: se fija sola al
    // crear (no es editable desde el formulario), igual para altas internas
    // (panel) o publicas (vease PersonaInteresadaRepository::create).
    public function create($data)
    {
        $data = (array) $data;
        if (empty($data['fecha_alta'])) {
            $data['fecha_alta'] = date('Y-m-d');
        }

        return parent::create($data);
    }

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

    // Columnas del catalogo texto libre que entran en la busqueda global (ver
    // $options['busqueda'] en search()): basta con una coincidencia en
    // cualquiera para que la fila aparezca.
    private $camposBusquedaGlobal = array(
        'p.nombre',
        'p.apellido_paterno',
        'p.apellido_materno',
        'p.numero_control',
        'p.telefono',
        'p.whatsapp',
        'p.email',
        'p.direccion',
        'p.barrio',
        'p.seccion',
        'p.como_se_entero',
        'p.observaciones',
        'p.estatus',
        'p.origen',
        'p.medio_contacto_preferido',
        'c.nombre',
        'a.nombre',
        'lid.nombre',
        'lid.apellido_paterno'
    );

    // $options soporta:
    //   'excluir_estatus' => array(...)   filtro "solo activos" (ver PersonaController::index)
    //   'busqueda' => string              coincidencia parcial en cualquier campo abierto o catalogo (casa/area/lider)
    //   'presencia' => array('casa_id' => true|false, 'lider_id' => true|false)  IS (NOT) NULL
    public function search(array $filters, $limit = 100, $offset = 0, array $options = array())
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
                $where[] = 'p.' . $field . ' LIKE ?';
                $types .= 's';
                $values[] = '%' . $value . '%';
            } else {
                $where[] = 'p.' . $field . ' = ?';
                $types .= is_int($value) ? 'i' : 's';
                $values[] = $value;
            }
        }

        $excluirEstatus = isset($options['excluir_estatus']) ? (array) $options['excluir_estatus'] : array();
        if (!empty($excluirEstatus)) {
            $placeholders = implode(', ', array_fill(0, count($excluirEstatus), '?'));
            $where[] = 'p.estatus NOT IN (' . $placeholders . ')';
            foreach ($excluirEstatus as $estatus) {
                $types .= 's';
                $values[] = $estatus;
            }
        }

        $presencia = isset($options['presencia']) ? (array) $options['presencia'] : array();
        foreach ($presencia as $campo => $requerido) {
            if ($requerido === null) {
                continue;
            }
            $where[] = 'p.' . $campo . ($requerido ? ' IS NOT NULL' : ' IS NULL');
        }

        $busqueda = isset($options['busqueda']) ? trim((string) $options['busqueda']) : '';
        if ($busqueda !== '') {
            $orConditions = array();
            foreach ($this->camposBusquedaGlobal as $campo) {
                $orConditions[] = $campo . ' LIKE ?';
                $types .= 's';
                $values[] = '%' . $busqueda . '%';
            }
            $where[] = '(' . implode(' OR ', $orConditions) . ')';
        }

        $sql = 'SELECT p.* FROM ' . $this->table . ' p'
            . ' LEFT JOIN casas c ON c.id = p.casa_id'
            . ' LEFT JOIN areas a ON a.id = p.area_id'
            . ' LEFT JOIN personas lid ON lid.id = p.lider_id';
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
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

    // Personas marcadas explicitamente como lider (vease PersonaController),
    // no solo quienes ya tienen gente a su cargo via lider_id.
    public function findLideres()
    {
        $sql = 'SELECT * FROM personas WHERE es_lider = 1 ORDER BY nombre ASC';
        $result = $this->db->query($sql);

        return $result ? $result->fetch_all(MYSQLI_ASSOC) : array();
    }
}
