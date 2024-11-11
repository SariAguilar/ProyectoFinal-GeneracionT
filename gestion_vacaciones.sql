-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_vacaciones;
USE gestion_vacaciones;

-- Tabla empleados: Información básica de cada empleado
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    fecha_ingreso DATE,
    INDEX (dni)
);

-- Tabla usuarios: Información de los usuarios registrados en la plataforma
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

-- Tabla asistencias: Registros de asistencia de cada empleado
CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('presente', 'ausente', 'justificado') NOT NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

-- Tabla solicitudes_vacaciones: Solicitudes de vacaciones con estado
CREATE TABLE solicitudes_vacaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

-- Tabla historial_vacaciones: Historial de vacaciones aprobadas
CREATE TABLE historial_vacaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);
INSERT INTO empleados (nombre, apellido, dni, fecha_nacimiento, fecha_ingreso)
VALUES 
('Juan', 'Perez', '12345678', '1985-01-15', '2020-06-01'),
('María', 'Gonzalez', '87654321', '1990-03-22', '2018-11-15'),
('Pedro', 'Ramirez', '45678912', '1982-07-30', '2015-02-20'),
('Sara Luz', 'Aguilar Mariaca', '47429971', '2024-08-22', '2024-04-10');


INSERT INTO usuarios (empleado_id, email, password)
VALUES 
(1, 'juan.perez@example.com', '$2b$10$somethingEncryptedHere1'), -- Contraseña encriptada para "juan.perez"),
(2, 'maria.gonzalez@example.com', '$2b$10$somethingEncryptedHere2'); -- Contraseña encriptada para "maria.gonzalez");

INSERT INTO asistencias (id_empleado, fecha, estado)
VALUES 
(1, '2024-11-01', 'presente'),
(1, '2024-11-02', 'presente'),
(2, '2024-11-01', 'ausente'),
(2, '2024-11-02', 'presente'),
(3, '2024-11-01', 'presente');

INSERT INTO usuarios (empleado_id, email, password)
VALUES 
(4, 'saraluzaguilar.m@gmail.com', '$2b$10$a6yjV2H141aDYlmD/6HBpOSLr5dHv2XkaD4C0PJMmFM35PUYQmW/e'); -- Contraseña encriptada para "rulito"),


ALTER TABLE empleados
ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo',
ADD COLUMN rol ENUM('empleado', 'administrador') DEFAULT 'empleado',
ADD COLUMN dias_vacaciones_acumulados INT DEFAULT 0;

ALTER TABLE solicitudes_vacaciones
ADD COLUMN observaciones TEXT;