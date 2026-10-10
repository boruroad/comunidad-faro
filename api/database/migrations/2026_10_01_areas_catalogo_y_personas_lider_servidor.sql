-- No destructivo.
-- 1) Catalogo de areas de servicio/ministerio (plano, igual que roles: sin
--    comunidad_id, nombre unico).
-- 2) personas.area_id: a que area sirve/pertenece la persona (catalogo).
-- 3) personas.es_lider / personas.es_servidor: designacion dentro de la
--    estructura de liderazgo, independiente de lider_id (a quien reporta)
--    y de quienes lo reportan como lider (vease PersonaController::lideres).
CREATE TABLE IF NOT EXISTS areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_areas_nombre (nombre)
);

ALTER TABLE personas
    ADD COLUMN area_id BIGINT UNSIGNED NULL AFTER lider_id,
    ADD COLUMN es_lider TINYINT(1) NOT NULL DEFAULT 0 AFTER asiste_casa,
    ADD COLUMN es_servidor TINYINT(1) NOT NULL DEFAULT 0 AFTER es_lider;

ALTER TABLE personas
    ADD CONSTRAINT fk_personas_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL;

ALTER TABLE personas ADD INDEX idx_personas_area (area_id);
