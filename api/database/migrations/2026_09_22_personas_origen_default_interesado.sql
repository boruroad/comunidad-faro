-- Ejecutar contra una base de datos EXISTENTE (no borra datos).
-- Motivo: el autoregistro publico de "interesados" es hoy el flujo mas comun de alta
-- en `personas`; si algun codigo llegara a insertar sin especificar `origen`, es mas
-- seguro que caiga en INTERESADO (requiere seguimiento) que en MIEMBRO por accidente.
ALTER TABLE personas
  MODIFY COLUMN origen ENUM('MIEMBRO','INTERESADO') NOT NULL DEFAULT 'INTERESADO';
