-- No destructivo. Agrega dos indicadores de asistencia y el rastro de quien
-- dio de alta el registro (usuario interno vs formulario publico de
-- "Ser Parte"). Si registrado_por_usuario_id es NULL, el alta vino del
-- formulario publico (PersonaInteresadaController::register, sin auth).
ALTER TABLE personas
    ADD COLUMN asiste_reunion_general TINYINT(1) NOT NULL DEFAULT 0 AFTER medio_contacto_preferido,
    ADD COLUMN asiste_casa TINYINT(1) NOT NULL DEFAULT 0 AFTER asiste_reunion_general,
    ADD COLUMN registrado_por_usuario_id BIGINT UNSIGNED NULL AFTER asiste_casa;

ALTER TABLE personas
    ADD CONSTRAINT fk_personas_registrado_por_usuario
        FOREIGN KEY (registrado_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE personas ADD INDEX idx_personas_registrado_por_usuario (registrado_por_usuario_id);
