<?php

class SiteConfigRepository extends BaseRepository
{
    protected $table = 'site_configs';

    private const META_SELECT_SQL = 'SELECT sc.*, '
        . 'uc.email AS created_by_email, '
        . 'ua.email AS activated_by_email, '
        . 'ud.email AS deactivated_by_email '
        . 'FROM site_configs sc '
        . 'LEFT JOIN usuarios uc ON uc.id = sc.created_by_usuario_id '
        . 'LEFT JOIN usuarios ua ON ua.id = sc.activated_by_usuario_id '
        . 'LEFT JOIN usuarios ud ON ud.id = sc.deactivated_by_usuario_id ';

    private const UPDATE_SITE_CONFIGS_PREFIX = 'UPDATE site_configs ';

    public function findAllWithMeta($limit = 100, $offset = 0)
    {
        $limit = max(1, (int) $limit);
        $offset = max(0, (int) $offset);

        $sql = self::META_SELECT_SQL
            . 'ORDER BY sc.created_at DESC, sc.id DESC '
            . 'LIMIT ? OFFSET ?';

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $rows ?: array();
    }

    public function findByIdWithMeta($id)
    {
        $id = (int) $id;

        $sql = self::META_SELECT_SQL . 'WHERE sc.id = ? LIMIT 1';

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ?: null;
    }

    public function findActive()
    {
        $sql = self::META_SELECT_SQL
            . 'WHERE sc.activo = 1 '
            . 'ORDER BY sc.activated_at DESC, sc.id DESC '
            . 'LIMIT 1';

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ?: null;
    }

    public function createVersion($nombre, $descripcion, $configJson, $createdByUserId, $activate)
    {
        $this->db->begin_transaction();

        try {
            $sql = 'INSERT INTO site_configs '
                . '(nombre, descripcion, config_json, activo, created_by_usuario_id, created_at, updated_at) '
                . 'VALUES (?, ?, ?, 0, ?, NOW(), NOW())';

            $stmt = $this->db->prepare($sql);
            $stmt->bind_param('sssi', $nombre, $descripcion, $configJson, $createdByUserId);
            $ok = $stmt->execute();
            $stmt->close();

            if (!$ok) {
                throw new SiteConfigException('could not create config version');
            }

            $id = (int) $this->db->insert_id;

            if ($activate) {
                $this->activateVersionInternal($id, (int) $createdByUserId);
            }

            $this->db->commit();
            return $id;
        } catch (Throwable $e) {
            $this->db->rollback();
            return 0;
        }
    }

    public function updateVersion($id, $fields)
    {
        $id = (int) $id;
        if ($id <= 0 || empty($fields)) {
            return false;
        }

        $set = array();
        $types = '';
        $values = array();

        foreach ($fields as $field => $value) {
            $set[] = $field . ' = ?';
            $types .= 's';
            $values[] = $value;
        }

        $set[] = 'updated_at = NOW()';

        $sql = 'UPDATE site_configs SET ' . implode(', ', $set) . ' WHERE id = ?';
        $types .= 'i';
        $values[] = $id;

        $stmt = $this->db->prepare($sql);
        $this->bindDynamic($stmt, $types, $values);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    public function activateVersion($id, $actorUserId)
    {
        $id = (int) $id;
        $actorUserId = (int) $actorUserId;

        if ($id <= 0 || $actorUserId <= 0) {
            return false;
        }

        $this->db->begin_transaction();

        try {
            $this->activateVersionInternal($id, $actorUserId);
            $this->db->commit();
            return true;
        } catch (Throwable $e) {
            $this->db->rollback();
            return false;
        }
    }

    public function deactivateVersion($id, $actorUserId)
    {
        $id = (int) $id;
        $actorUserId = (int) $actorUserId;

        if ($id <= 0 || $actorUserId <= 0) {
            return false;
        }

        $sql = self::UPDATE_SITE_CONFIGS_PREFIX
            . 'SET activo = 0, deactivated_at = NOW(), deactivated_by_usuario_id = ?, updated_at = NOW() '
            . 'WHERE id = ?';

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('ii', $actorUserId, $id);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    private function activateVersionInternal($id, $actorUserId)
    {
        $deactivateSql = self::UPDATE_SITE_CONFIGS_PREFIX
            . 'SET activo = 0, deactivated_at = NOW(), deactivated_by_usuario_id = ?, updated_at = NOW() '
            . 'WHERE activo = 1 AND id <> ?';

        $deactivateStmt = $this->db->prepare($deactivateSql);
        $deactivateStmt->bind_param('ii', $actorUserId, $id);
        $deactivateOk = $deactivateStmt->execute();
        $deactivateStmt->close();

        if (!$deactivateOk) {
            throw new SiteConfigException('could not deactivate previous config');
        }

        $activateSql = self::UPDATE_SITE_CONFIGS_PREFIX
            . 'SET activo = 1, activated_at = NOW(), activated_by_usuario_id = ?, '
            . 'deactivated_at = NULL, deactivated_by_usuario_id = NULL, updated_at = NOW() '
            . 'WHERE id = ?';

        $activateStmt = $this->db->prepare($activateSql);
        $activateStmt->bind_param('ii', $actorUserId, $id);
        $activateOk = $activateStmt->execute();
        $affected = $activateStmt->affected_rows;
        $activateStmt->close();

        if (!$activateOk || $affected <= 0) {
            throw new SiteConfigException('config version not found');
        }
    }
}
