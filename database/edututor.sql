-- ============================================================
-- EduTutor - Script de creación de la base de datos (MySQL 8)
-- Ejecutar en MySQL Workbench: File > Open SQL Script > rayo
-- Se puede ejecutar varias veces sin borrar datos.
-- ============================================================

CREATE DATABASE IF NOT EXISTS edututor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edututor;

CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  apellido VARCHAR(60) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE IF NOT EXISTS estudiantes (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  grado VARCHAR(30),
  seccion VARCHAR(10),
  telefono VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tutores (
  id_tutor INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  especialidad VARCHAR(100),
  descripcion TEXT,
  telefono VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materias (
  id_materia INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tutor_materia (
  id_tutor INT NOT NULL,
  id_materia INT NOT NULL,
  PRIMARY KEY (id_tutor, id_materia),
  FOREIGN KEY (id_tutor) REFERENCES tutores(id_tutor) ON DELETE CASCADE,
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disponibilidades (
  id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
  id_tutor INT NOT NULL,
  dia_semana ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  FOREIGN KEY (id_tutor) REFERENCES tutores(id_tutor) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tutorias (
  id_tutoria INT AUTO_INCREMENT PRIMARY KEY,
  id_tutor INT NOT NULL,
  id_materia INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  modalidad ENUM('Presencial','Virtual') NOT NULL DEFAULT 'Presencial',
  cupo INT NOT NULL DEFAULT 1,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado ENUM('Activa','Cerrada','Cancelada') NOT NULL DEFAULT 'Activa',
  FOREIGN KEY (id_tutor) REFERENCES tutores(id_tutor),
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia)
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  id_tutoria INT NOT NULL,
  estado ENUM('Pendiente','Aceptada','Rechazada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  comentario VARCHAR(255),
  fecha_solicitud DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_estudiante, id_tutoria),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  FOREIGN KEY (id_tutoria) REFERENCES tutorias(id_tutoria) ON DELETE CASCADE
);

INSERT IGNORE INTO roles (nombre) VALUES ('Administrador'), ('Tutor'), ('Estudiante');

-- Nota: la cuenta de administrador y las materias de ejemplo las crea
-- el servidor automáticamente la primera vez que se inicia.
