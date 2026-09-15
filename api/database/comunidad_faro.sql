-- =========================================================
-- COMUNIDAD FARO - ESQUEMA MYSQL V2
-- Comunidad Faro
-- =========================================================

USE comunidad_faro;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS personas;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS comunidades;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE comunidades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    lugar VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_comunidades_nombre_lugar (nombre, lugar)
);

CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion) VALUES
('SUPERADMIN', 'Administrador global de la plataforma'),
('ADMIN_COMUNIDAD', 'Administrador de una comunidad'),
('CONSULTA', 'Acceso de solo lectura');

CREATE TABLE personas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comunidad_id BIGINT UNSIGNED NOT NULL,
    numero_control VARCHAR(40) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    telefono VARCHAR(30),
    email VARCHAR(150),
    direccion VARCHAR(255),
    barrio VARCHAR(120),
    seccion VARCHAR(120),
    fecha_alta DATE NULL,
    estatus ENUM('ACTIVO','INACTIVO','FALLECIDO','BAJA') NOT NULL DEFAULT 'ACTIVO',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_personas_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidades(id),
    UNIQUE KEY uk_persona_numero_control (comunidad_id, numero_control),
    INDEX idx_personas_comunidad (comunidad_id),
    INDEX idx_personas_nombre (nombre, apellido_paterno, apellido_materno),
    INDEX idx_personas_estatus (estatus)
);

CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comunidad_id BIGINT UNSIGNED NULL,
    persona_id BIGINT UNSIGNED NULL,
    rol_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidades(id),
    CONSTRAINT fk_usuarios_persona FOREIGN KEY (persona_id) REFERENCES personas(id),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
    UNIQUE KEY uk_usuarios_email (email),
    INDEX idx_usuarios_comunidad (comunidad_id),
    INDEX idx_usuarios_rol (rol_id)
);

-- Tokens de sesion (login) y de recuperacion de contrasena
CREATE TABLE auth_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    token_type ENUM('AUTH','PASSWORD_RESET') NOT NULL DEFAULT 'AUTH',
    expires_at DATETIME NULL,
    revoked_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auth_tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY uk_auth_tokens_token (token),
    INDEX idx_auth_tokens_usuario (usuario_id),
    INDEX idx_auth_tokens_type (token_type)
);
