-- No destructivo. Catalogo de casas (asociadas a una comunidad) + relacion
-- persona -> casa y persona -> lider (auto-referencia) en la tabla personas.

CREATE TABLE IF NOT EXISTS casas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comunidad_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10,7) NULL,
    longitud DECIMAL(10,7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_casas_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidades(id),
    INDEX idx_casas_comunidad (comunidad_id)
);

ALTER TABLE personas
    ADD COLUMN casa_id BIGINT UNSIGNED NULL AFTER comunidad_id,
    ADD COLUMN lider_id BIGINT UNSIGNED NULL AFTER casa_id;

ALTER TABLE personas
    ADD CONSTRAINT fk_personas_casa FOREIGN KEY (casa_id) REFERENCES casas(id),
    ADD CONSTRAINT fk_personas_lider FOREIGN KEY (lider_id) REFERENCES personas(id);

ALTER TABLE personas ADD INDEX idx_personas_casa (casa_id);
ALTER TABLE personas ADD INDEX idx_personas_lider (lider_id);
