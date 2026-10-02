-- No destructivo. Agrega catalogo de roles para lideres/pastores/servidores.
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('PASTOR', 'Pastor de la comunidad'),
('LIDER', 'Lider de una casa o grupo'),
('SERVIDOR', 'Servidor dentro de la comunidad');
