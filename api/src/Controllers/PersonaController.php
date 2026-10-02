<?php

class PersonaController extends CrudController
{
    protected $resourceLabel = 'persona';
    protected $allowedFields = array(
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
        'estatus',
        'como_se_entero',
        'medio_contacto_preferido',
        'asiste_reunion_general',
        'asiste_casa',
        'es_lider',
        'es_servidor',
        'observaciones'
    );
    // fecha_alta queda fuera a proposito: no es editable por el cliente, se
    // genera en automatico (vease PersonaRepository::create).
    protected $filterableFields = array(
        'comunidad_id',
        'casa_id',
        'lider_id',
        'area_id',
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
        'asiste_reunion_general',
        'asiste_casa',
        'es_lider',
        'es_servidor',
        'observaciones'
    );
    protected $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD', 'CAPTURISTA');

    // Estatus que se excluyen por defecto cuando "solo activos" esta activo
    // (vease index()): dejan fuera solo lo claramente no vigente.
    private $estatusInactivos = array('INACTIVO', 'BAJA', 'FALLECIDO', 'DESCARTADO');

    private $casas;
    private $usuarios;
    private $areas;

    public function __construct()
    {
        $this->repo = new PersonaRepository();
        $this->casas = new CasaRepository();
        $this->usuarios = new UsuarioRepository();
        $this->areas = new AreaRepository();
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

        // "Solo activos" esta prendido por defecto y excluye estatus claramente
        // no vigentes; se desactiva si el cliente manda solo_activos=0/false o
        // si ya eligio un estatus especifico (séria contradictorio combinarlos).
        $soloActivos = true;
        if (isset($request['solo_activos'])) {
            $value = strtolower((string) $request['solo_activos']);
            $soloActivos = !in_array($value, array('0', 'false', ''), true);
        }
        if (!empty($conditions['estatus'])) {
            $soloActivos = false;
        }

        // con_casa/con_lider: "tiene asignada una casa/lider" (si/no), usado por
        // los indicadores del dashboard (ej. "Sin lider" -> con_lider=0).
        $presencia = array();
        if (isset($request['con_casa']) && $request['con_casa'] !== '') {
            $presencia['casa_id'] = $this->parseBooleanParam($request['con_casa']);
        }
        if (isset($request['con_lider']) && $request['con_lider'] !== '') {
            $presencia['lider_id'] = $this->parseBooleanParam($request['con_lider']);
        }

        $busqueda = isset($request['busqueda']) ? trim((string) $request['busqueda']) : '';

        $rows = $this->repo->search($conditions, $limit, $offset, array(
            'excluir_estatus' => $soloActivos ? $this->estatusInactivos : array(),
            'presencia' => $presencia,
            'busqueda' => $busqueda,
        ));
        $rows = $this->enrichRows($rows);

        return $this->ok(array(
            'items' => $this->camelize($rows),
        ), $this->resourceLabel . ' list');
    }

    private function parseBooleanParam($value)
    {
        return !in_array(strtolower((string) $value), array('0', 'false'), true);
    }

    // El registrado_por_usuario_id no es un campo editable por el cliente: siempre
    // se fija al usuario autenticado que da de alta el registro desde el panel.
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

        $payload['registrado_por_usuario_id'] = (int) $usuario->id;

        $id = $this->repo->create($payload);
        if ($id <= 0) {
            return $this->fail($this->resourceLabel . ' could not be created', 409);
        }

        $created = $this->enrichRows(array($this->repo->findById($id)));

        return $this->ok(array(
            'item' => $this->camelize($created[0]),
        ), $this->resourceLabel . ' created');
    }

    // Sobrescribe el update generico solo para devolver la fila enriquecida
    // (casa_nombre, lider_nombre, registrado_por_nombre): de lo contrario el
    // front recibe la fila cruda y esos datos desaparecen de la tabla tras editar.
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

        $updated = $this->enrichRows(array($this->repo->findById($id)));

        return $this->ok(array(
            'item' => $this->camelize($updated[0]),
        ), $this->resourceLabel . ' updated');
    }

    // Agrega nombre de la casa, del lider y de quien registro el alta, para
    // mostrarlos en la tabla sin viajes extra desde el front.
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

            $row['area_nombre'] = null;
            if (!empty($row['area_id'])) {
                $area = $this->areas->findById((int) $row['area_id']);
                $row['area_nombre'] = $area ? $area['nombre'] : null;
            }

            $row['registrado_por_nombre'] = $this->resolveRegistradoPorNombre(
                $row['registrado_por_usuario_id'] ?? null
            );

            return $row;
        }, $rows);
    }

    // NULL significa alta por el formulario publico (PersonaInteresadaController::register,
    // sin autenticacion); si hay usuario, mostramos su nombre y si no tiene persona
    // ligada caemos a su correo.
    private function resolveRegistradoPorNombre($usuarioId)
    {
        if (empty($usuarioId)) {
            return 'Formulario';
        }

        $usuario = $this->usuarios->findById((int) $usuarioId);
        if (!$usuario) {
            return 'Formulario';
        }

        if (!empty($usuario['persona_id'])) {
            $persona = $this->repo->findById((int) $usuario['persona_id']);
            if ($persona) {
                $nombre = trim($persona['nombre'] . ' ' . $persona['apellido_paterno']);
                if ($nombre !== '') {
                    return $nombre;
                }
            }
        }

        return $usuario['email'];
    }

    // Catalogo para el combo "Lider": solo personas marcadas como es_lider=1.
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
