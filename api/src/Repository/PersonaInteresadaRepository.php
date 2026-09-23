<?php

// Usa la misma tabla `personas`, acotada a los registros con origen=INTERESADO.
class PersonaInteresadaRepository extends BaseRepository
{
    protected $table = 'personas';
    protected $fillable = array(
        'origen',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'whatsapp',
        'email',
        'como_se_entero',
        'medio_contacto_preferido',
        'observaciones',
        'estatus',
        'acepto_privacidad',
        'acepto_privacidad_at'
    );
}
