<?php

class SiteConfig extends BaseModel
{
    public $id;
    public $nombre;
    public $descripcion;
    public $config_json;
    public $activo;
    public $created_by_usuario_id;
    public $activated_by_usuario_id;
    public $deactivated_by_usuario_id;
    public $activated_at;
    public $deactivated_at;
    public $created_at;
    public $updated_at;
}