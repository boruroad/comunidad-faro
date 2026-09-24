<?php

class CasaRepository extends BaseRepository
{
    protected $table = 'casas';
    protected $fillable = array('comunidad_id', 'nombre', 'direccion', 'latitud', 'longitud');

    // Evita un 500 por FK si la casa todavia tiene personas asignadas.
    public function hasDependents($casaId)
    {
        $sql = 'SELECT COUNT(*) AS total FROM personas WHERE casa_id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $casaId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row && (int) $row['total'] > 0;
    }
}
