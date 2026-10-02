<?php

class AreaRepository extends BaseRepository
{
    protected $table = 'areas';
    protected $fillable = array('nombre', 'descripcion');

    public function findByNombre($nombre)
    {
        $sql = 'SELECT * FROM areas WHERE nombre = ? LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $nombre);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ?: null;
    }

    // Evita un 500 por FK si todavia hay personas asignadas a esta area.
    public function hasDependents($areaId)
    {
        $sql = 'SELECT COUNT(*) AS total FROM personas WHERE area_id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $areaId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row && (int) $row['total'] > 0;
    }
}
