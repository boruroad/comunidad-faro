<?php

class PersonaController extends CrudController
{
    protected $resourceLabel = 'persona';
    protected $allowedFields = array(
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
    protected $filterableFields = array(
        'comunidad_id',
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

    public function __construct()
    {
        $this->repo = new PersonaRepository();
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

        return $this->ok(array(
            'items' => $this->camelize($rows),
        ), $this->resourceLabel . ' list');
    }
}
