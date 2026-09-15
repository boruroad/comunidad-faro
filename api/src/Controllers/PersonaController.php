<?php

class PersonaController extends CrudController
{
    protected $resourceLabel = 'persona';
    protected $allowedFields = array(
        'comunidad_id',
        'numero_control',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'fecha_nacimiento',
        'telefono',
        'email',
        'direccion',
        'barrio',
        'seccion',
        'fecha_alta',
        'estatus',
        'observaciones'
    );
    protected $filterableFields = array('comunidad_id', 'estatus', 'numero_control');
    protected $writeRoles = array('SUPERADMIN', 'ADMIN_COMUNIDAD', 'CAPTURISTA');

    public function __construct()
    {
        $this->repo = new PersonaRepository();
    }
}
