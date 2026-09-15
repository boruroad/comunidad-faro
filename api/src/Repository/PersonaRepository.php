<?php

class PersonaRepository extends BaseRepository
{
    protected $table = 'personas';
    protected $fillable = array(
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
}
