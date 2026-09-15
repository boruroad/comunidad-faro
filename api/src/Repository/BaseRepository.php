<?php

class BaseRepository
{
    protected $db;
    protected $table = '';
    protected $fillable = array();

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    public function findById($id)
    {
        $sql = 'SELECT * FROM ' . $this->table . ' WHERE id = ? LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ?: null;
    }

    public function findAll($limit = 100, $offset = 0)
    {
        $limit = max(1, (int) $limit);
        $offset = max(0, (int) $offset);

        $sql = 'SELECT * FROM ' . $this->table . ' LIMIT ? OFFSET ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $rows ?: array();
    }

    public function findAllBy($conditions, $limit = 100, $offset = 0)
    {
        $limit = max(1, (int) $limit);
        $offset = max(0, (int) $offset);

        $where = array();
        $types = '';
        $values = array();

        foreach ((array) $conditions as $key => $value) {
            $where[] = $key . ' = ?';
            $types .= is_int($value) ? 'i' : 's';
            $values[] = $value;
        }

        if (empty($where)) {
            return $this->findAll($limit, $offset);
        }

        $sql = 'SELECT * FROM ' . $this->table . ' WHERE ' . implode(' AND ', $where) . ' LIMIT ? OFFSET ?';
        $types .= 'ii';
        $values[] = $limit;
        $values[] = $offset;

        $stmt = $this->db->prepare($sql);
        $this->bindDynamic($stmt, $types, $values);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $rows ?: array();
    }

    public function create($data)
    {
        $payload = $this->onlyFillable((array) $data);
        if (empty($payload)) {
            return 0;
        }

        $fields = array_keys($payload);
        $placeholders = array_fill(0, count($fields), '?');

        $sql = 'INSERT INTO ' . $this->table .
            ' (' . implode(', ', $fields) . ')' .
            ' VALUES (' . implode(', ', $placeholders) . ')';

        $stmt = $this->db->prepare($sql);

        $types = '';
        $values = array();
        foreach ($payload as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
            $values[] = $value;
        }

        $this->bindDynamic($stmt, $types, $values);
        $ok = $stmt->execute();
        $id = $ok ? (int) $this->db->insert_id : 0;
        $stmt->close();

        return $id;
    }

    public function updateById($id, $data)
    {
        $payload = $this->onlyFillable((array) $data);
        if (empty($payload)) {
            return false;
        }

        $set = array();
        $types = '';
        $values = array();

        foreach ($payload as $field => $value) {
            $set[] = $field . ' = ?';
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
            $values[] = $value;
        }

        $sql = 'UPDATE ' . $this->table . ' SET ' . implode(', ', $set) . ' WHERE id = ?';
        $types .= 'i';
        $values[] = (int) $id;

        $stmt = $this->db->prepare($sql);
        $this->bindDynamic($stmt, $types, $values);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    public function deleteById($id)
    {
        $sql = 'DELETE FROM ' . $this->table . ' WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $id);
        $ok = $stmt->execute();
        $stmt->close();

        return $ok;
    }

    protected function onlyFillable($data)
    {
        if (empty($this->fillable)) {
            return $data;
        }

        $filtered = array();
        foreach ($this->fillable as $field) {
            if (array_key_exists($field, $data)) {
                $filtered[$field] = $data[$field];
            }
        }

        return $filtered;
    }

    private function bindDynamic($stmt, $types, $values)
    {
        $refs = array();
        $refs[] = &$types;

        foreach ($values as $index => $value) {
            $refs[] = &$values[$index];
        }

        call_user_func_array(array($stmt, 'bind_param'), $refs);
    }
}
