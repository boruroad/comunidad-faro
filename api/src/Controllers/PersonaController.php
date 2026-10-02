<?php

class PersonaController extends CrudController
{
    protected $resourceLabel = 'persona';
    protected $allowedFields = array(
        'comunidad_id',
        'casa_id',
        'lider_id',
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
    protected $filterableFields = array(
        'comunidad_id',
        'casa_id',
        'lider_id',
        'numero_control',
        'origen',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'telefono',
        'whatsapp',
        'email',
        'direccion',
        'barrio',
        'seccion',
        'estatus',
        'como_se_entero',
        'medio_contacto_preferido',
        'observaciones'
    );
    protected $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD', 'CAPTURISTA');

    private $casas;

    public function __construct()
    {
        $this->repo = new PersonaRepository();
        $this->casas = new CasaRepository();
    }

    // Busqueda por coincidencia parcial en cada campo (mas exacta en origen/estatus/etc).
    // No fuerza ningun origen por defecto: el filtro lo decide quien consulta.
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

        $rows = $this->repo->search($conditions, $limit, $offset);
        $rows = $this->enrichRows($rows);

        return $this->ok(array(
            'items' => $this->camelize($rows),
        ), $this->resourceLabel . ' list');
    }

    // Agrega nombre de la casa y del lider para mostrarlos en la tabla sin viajes extra desde el front.
    private function enrichRows(array $rows)
    {
        return array_map(function ($row) {
            $row['casa_nombre'] = null;
            if (!empty($row['casa_id'])) {
                $casa = $this->casas->findById((int) $row['casa_id']);
                $row['casa_nombre'] = $casa ? $casa['nombre'] : null;
            }

            $row['lider_nombre'] = null;
            if (!empty($row['lider_id'])) {
                $lider = $this->repo->findById((int) $row['lider_id']);
                if ($lider) {
                    $row['lider_nombre'] = trim($lider['nombre'] . ' ' . $lider['apellido_paterno']);
                }
            }

            return $row;
        }, $rows);
    }

    // Catalogo para el filtro "Lider": solo personas que ya lideran a alguien.
    public function lideres($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }

        $rows = $this->repo->findLideres();

        return $this->ok(array(
            'items' => $this->camelize($rows),
        ), 'lideres list');
    }
}
