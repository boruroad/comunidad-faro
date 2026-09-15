<?php

class ComunidadRepository extends BaseRepository
{
    protected $table = 'comunidades';
    protected $fillable = array('nombre', 'lugar', 'direccion');

    public function findModelById($id)
    {
        $row = $this->findById($id);
        return $row ? new Comunidad($row) : null;
    }
}
