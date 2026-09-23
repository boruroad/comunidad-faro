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

    // Evita un 500 por violacion de FK si la comunidad todavia tiene personas/usuarios.
    public function hasDependents($comunidadId)
    {
        $sql = 'SELECT
                (SELECT COUNT(*) FROM personas WHERE comunidad_id = ?) +
                (SELECT COUNT(*) FROM usuarios WHERE comunidad_id = ?) AS total';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('ii', $comunidadId, $comunidadId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row && (int) $row['total'] > 0;
    }
}
