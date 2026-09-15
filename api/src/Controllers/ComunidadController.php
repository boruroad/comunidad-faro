<?php

class ComunidadController extends CrudController
{
    protected $resourceLabel = 'comunidad';
    protected $allowedFields = array('nombre', 'lugar', 'direccion');
    protected $filterableFields = array('nombre', 'lugar');
    protected $writeRoles = array('SUPERADMIN', 'ADMIN');

    public function __construct()
    {
        $this->repo = new ComunidadRepository();
    }
}
