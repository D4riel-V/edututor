-- ============================================================
-- EduTutor - Datos de ejemplo (para pruebas y presentación)
-- Crea: 6 tutores, 20 estudiantes, 14 tutorías, 12 horarios,
--       8 materias y 38 solicitudes.
-- Contraseña de TODOS los usuarios de ejemplo: Demo1234
-- Correos: nombre.apellido@example.com (ver lista al final)
--
-- Se puede ejecutar varias veces: no duplica los datos.
-- Las fechas de las tutorías son relativas a HOY (siempre futuras).
--
-- IMPORTANTE: elige la base de datos antes de ejecutar.
--   En tu computadora: USE edututor;
--   En Aiven (nube):   cambia la línea de abajo por USE defaultdb;
-- ============================================================

SET NAMES utf8mb4;
USE edututor;

SET @hash = '$2a$10$FAMPG3DpUnVnXsV1x1Gqc.JOGi.g04waY/Guv9V4XDhZKMdoXYglC';

INSERT IGNORE INTO roles (nombre) VALUES ('Administrador'), ('Tutor'), ('Estudiante');

INSERT IGNORE INTO materias (nombre, descripcion) VALUES
  ('Matemática', 'Álgebra, geometría, trigonometría y cálculo básico'),
  ('Lenguaje y Literatura', 'Redacción, ortografía y análisis de textos'),
  ('Ciencias Naturales', 'Biología, ecología y ciencias de la vida'),
  ('Estudios Sociales', 'Historia, geografía y cívica'),
  ('Inglés', 'Gramática, vocabulario y conversación'),
  ('Física', 'Mecánica, energía y electricidad'),
  ('Química', 'Materia, reacciones y formulación'),
  ('Informática', 'Programación, bases de datos y desarrollo web');

-- ---------- Usuarios: tutores ----------
INSERT IGNORE INTO usuarios (nombre, apellido, correo, contrasena_hash, id_rol) VALUES
  ('Ana Lucía', 'Martínez', 'ana.martinez@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Tutor')),
  ('Carlos Eduardo', 'Ramírez', 'carlos.ramirez@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Tutor')),
  ('Karla Beatriz', 'Hernández', 'karla.hernandez@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Tutor')),
  ('José Roberto', 'Flores', 'jose.flores@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Tutor')),
  ('María Fernanda', 'Cruz', 'maria.cruz@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Tutor')),
  ('Luis Alberto', 'Menjívar', 'luis.menjivar@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Tutor'));

-- ---------- Usuarios: estudiantes ----------
INSERT IGNORE INTO usuarios (nombre, apellido, correo, contrasena_hash, id_rol) VALUES
  ('Camila Alejandra', 'Rivas', 'camila.rivas@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Daniel Alexander', 'Portillo', 'daniel.portillo@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Valeria Michelle', 'Guzmán', 'valeria.guzman@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Kevin Josué', 'Orellana', 'kevin.orellana@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Fátima Nicole', 'Aguilar', 'fatima.aguilar@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Diego Armando', 'Chávez', 'diego.chavez@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Génesis Abigail', 'Torres', 'genesis.torres@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Marvin Ernesto', 'Alvarado', 'marvin.alvarado@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Paola Andrea', 'Mejía', 'paola.mejia@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Óscar Mauricio', 'Rodríguez', 'oscar.rodriguez@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Daniela Yamileth', 'Reyes', 'daniela.reyes@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Jonathan David', 'Salazar', 'jonathan.salazar@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Alison Raquel', 'Campos', 'alison.campos@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Bryan Alexis', 'Mendoza', 'bryan.mendoza@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Sofía Isabel', 'Pineda', 'sofia.pineda@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Emerson Geovanny', 'Ayala', 'emerson.ayala@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Melissa Carolina', 'Vásquez', 'melissa.vasquez@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Rodrigo Antonio', 'Escobar', 'rodrigo.escobar@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Ximena Guadalupe', 'Navarro', 'ximena.navarro@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante')),
  ('Wilfredo Ismael', 'Cáceres', 'wilfredo.caceres@example.com', @hash, (SELECT id_rol FROM roles WHERE nombre = 'Estudiante'));

-- ---------- Perfiles de tutores ----------
INSERT IGNORE INTO tutores (id_usuario, especialidad, descripcion, telefono)
  SELECT id_usuario, 'Matemática y Física', 'Profesora de ciencias exactas con experiencia en refuerzo escolar. Explico paso a paso y con ejemplos.', NULL FROM usuarios WHERE correo = 'ana.martinez@example.com';
INSERT IGNORE INTO tutores (id_usuario, especialidad, descripcion, telefono)
  SELECT id_usuario, 'Informática y programación', 'Técnico en desarrollo de software. Ayudo con HTML, CSS, JavaScript y bases de datos.', NULL FROM usuarios WHERE correo = 'carlos.ramirez@example.com';
INSERT IGNORE INTO tutores (id_usuario, especialidad, descripcion, telefono)
  SELECT id_usuario, 'Lenguaje y Literatura', 'Licenciada en letras. Me enfoco en redacción, ortografía y comprensión lectora.', NULL FROM usuarios WHERE correo = 'karla.hernandez@example.com';
INSERT IGNORE INTO tutores (id_usuario, especialidad, descripcion, telefono)
  SELECT id_usuario, 'Ciencias Naturales y Química', 'Apasionado por la biología y la química; uso experimentos y esquemas para explicar.', NULL FROM usuarios WHERE correo = 'jose.flores@example.com';
INSERT IGNORE INTO tutores (id_usuario, especialidad, descripcion, telefono)
  SELECT id_usuario, 'Inglés', 'Certificada en enseñanza del inglés. Practicamos conversación, gramática y vocabulario.', NULL FROM usuarios WHERE correo = 'maria.cruz@example.com';
INSERT IGNORE INTO tutores (id_usuario, especialidad, descripcion, telefono)
  SELECT id_usuario, 'Estudios Sociales', 'Docente de historia y geografía. Preparo resúmenes y mapas para facilitar el estudio.', NULL FROM usuarios WHERE correo = 'luis.menjivar@example.com';

-- ---------- Perfiles de estudiantes ----------
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'A', NULL FROM usuarios WHERE correo = 'camila.rivas@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'A', NULL FROM usuarios WHERE correo = 'daniel.portillo@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'B', NULL FROM usuarios WHERE correo = 'valeria.guzman@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'B', NULL FROM usuarios WHERE correo = 'kevin.orellana@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'C', NULL FROM usuarios WHERE correo = 'fatima.aguilar@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'A', NULL FROM usuarios WHERE correo = 'diego.chavez@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'A', NULL FROM usuarios WHERE correo = 'genesis.torres@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'B', NULL FROM usuarios WHERE correo = 'marvin.alvarado@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'B', NULL FROM usuarios WHERE correo = 'paola.mejia@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'C', NULL FROM usuarios WHERE correo = 'oscar.rodriguez@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Tercer año', 'A', NULL FROM usuarios WHERE correo = 'daniela.reyes@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Tercer año', 'A', NULL FROM usuarios WHERE correo = 'jonathan.salazar@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Tercer año', 'B', NULL FROM usuarios WHERE correo = 'alison.campos@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Tercer año', 'B', NULL FROM usuarios WHERE correo = 'bryan.mendoza@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Tercer año', 'C', NULL FROM usuarios WHERE correo = 'sofia.pineda@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'C', NULL FROM usuarios WHERE correo = 'emerson.ayala@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'C', NULL FROM usuarios WHERE correo = 'melissa.vasquez@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Tercer año', 'C', NULL FROM usuarios WHERE correo = 'rodrigo.escobar@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Primer año', 'A', NULL FROM usuarios WHERE correo = 'ximena.navarro@example.com';
INSERT IGNORE INTO estudiantes (id_usuario, grado, seccion, telefono)
  SELECT id_usuario, 'Segundo año', 'A', NULL FROM usuarios WHERE correo = 'wilfredo.caceres@example.com';

-- ---------- Materias que imparte cada tutor ----------
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Matemática'
  WHERE u.correo = 'ana.martinez@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Física'
  WHERE u.correo = 'ana.martinez@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Informática'
  WHERE u.correo = 'carlos.ramirez@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Lenguaje y Literatura'
  WHERE u.correo = 'karla.hernandez@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Ciencias Naturales'
  WHERE u.correo = 'jose.flores@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Química'
  WHERE u.correo = 'jose.flores@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Inglés'
  WHERE u.correo = 'maria.cruz@example.com';
INSERT IGNORE INTO tutor_materia (id_tutor, id_materia)
  SELECT tu.id_tutor, m.id_materia FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Estudios Sociales'
  WHERE u.correo = 'luis.menjivar@example.com';

-- ---------- Disponibilidad de los tutores ----------
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Lunes', '14:00', '17:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'ana.martinez@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Lunes' AND d.hora_inicio = '14:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Miércoles', '15:00', '17:30' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'ana.martinez@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Miércoles' AND d.hora_inicio = '15:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Martes', '15:00', '18:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'carlos.ramirez@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Martes' AND d.hora_inicio = '15:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Jueves', '16:00', '18:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'carlos.ramirez@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Jueves' AND d.hora_inicio = '16:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Lunes', '13:00', '15:30' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'karla.hernandez@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Lunes' AND d.hora_inicio = '13:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Viernes', '14:00', '16:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'karla.hernandez@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Viernes' AND d.hora_inicio = '14:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Martes', '08:00', '10:30' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'jose.flores@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Martes' AND d.hora_inicio = '08:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Sábado', '09:00', '11:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'jose.flores@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Sábado' AND d.hora_inicio = '09:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Miércoles', '10:00', '12:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'maria.cruz@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Miércoles' AND d.hora_inicio = '10:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Jueves', '15:00', '17:00' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'maria.cruz@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Jueves' AND d.hora_inicio = '15:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Lunes', '14:00', '16:30' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'luis.menjivar@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Lunes' AND d.hora_inicio = '14:00');
INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin)
  SELECT tu.id_tutor, 'Viernes', '13:30', '15:30' FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario
  WHERE u.correo = 'luis.menjivar@example.com'
    AND NOT EXISTS (SELECT 1 FROM disponibilidades d WHERE d.id_tutor = tu.id_tutor AND d.dia_semana = 'Viernes' AND d.hora_inicio = '13:30');

-- ---------- Tutorías ----------
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Repaso de ecuaciones y álgebra', 'Ecuaciones lineales y cuadráticas con ejercicios guiados.', 'Presencial', 6, CURDATE() + INTERVAL 2 DAY, '15:00', '16:30', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Matemática'
  WHERE u.correo = 'ana.martinez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Repaso de ecuaciones y álgebra');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Cinemática: movimiento rectilíneo', 'Velocidad, aceleración y problemas tipo examen.', 'Virtual', 5, CURDATE() + INTERVAL 4 DAY, '16:00', '17:00', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Física'
  WHERE u.correo = 'ana.martinez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Cinemática: movimiento rectilíneo');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Preparación de examen de trigonometría', 'Razones trigonométricas y resolución de triángulos.', 'Presencial', 8, CURDATE() + INTERVAL 7 DAY, '14:00', '15:30', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Matemática'
  WHERE u.correo = 'ana.martinez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Preparación de examen de trigonometría');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Introducción a HTML y CSS', 'Estructura de una página web y estilos básicos.', 'Presencial', 10, CURDATE() + INTERVAL 3 DAY, '15:00', '17:00', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Informática'
  WHERE u.correo = 'carlos.ramirez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Introducción a HTML y CSS');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Bases de datos con MySQL', 'Tablas, llaves y consultas SELECT, INSERT, UPDATE y DELETE.', 'Virtual', 6, CURDATE() + INTERVAL 9 DAY, '16:00', '17:30', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Informática'
  WHERE u.correo = 'carlos.ramirez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Bases de datos con MySQL');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Redacción de ensayos', 'Introducción, desarrollo y conclusión de un ensayo.', 'Presencial', 8, CURDATE() + INTERVAL 5 DAY, '14:00', '15:00', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Lenguaje y Literatura'
  WHERE u.correo = 'karla.hernandez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Redacción de ensayos');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Análisis de textos literarios', 'Tema, personajes y recursos literarios.', 'Virtual', 6, CURDATE() + INTERVAL 11 DAY, '15:30', '16:30', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Lenguaje y Literatura'
  WHERE u.correo = 'karla.hernandez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Análisis de textos literarios');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'La célula y sus funciones', 'Organelos, tipos de células y procesos celulares.', 'Presencial', 8, CURDATE() + INTERVAL 6 DAY, '08:30', '09:30', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Ciencias Naturales'
  WHERE u.correo = 'jose.flores@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'La célula y sus funciones');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Balanceo de ecuaciones químicas', 'Método de tanteo y conservación de la masa.', 'Virtual', 5, CURDATE() + INTERVAL 8 DAY, '09:00', '10:00', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Química'
  WHERE u.correo = 'jose.flores@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Balanceo de ecuaciones químicas');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Conversación básica en inglés', 'Presentaciones, preguntas comunes y vocabulario diario.', 'Presencial', 10, CURDATE() + INTERVAL 4 DAY, '10:00', '11:00', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Inglés'
  WHERE u.correo = 'maria.cruz@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Conversación básica en inglés');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Gramática: tiempos verbales', 'Presente, pasado y futuro con práctica.', 'Virtual', 6, CURDATE() + INTERVAL 12 DAY, '15:00', '16:00', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Inglés'
  WHERE u.correo = 'maria.cruz@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Gramática: tiempos verbales');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Historia de El Salvador: siglo XX', 'Hechos y procesos principales con línea de tiempo.', 'Presencial', 8, CURDATE() + INTERVAL 10 DAY, '14:00', '15:30', 'Activa'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Estudios Sociales'
  WHERE u.correo = 'luis.menjivar@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Historia de El Salvador: siglo XX');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Repaso de geografía de Centroamérica', 'Países, capitales y relieve.', 'Presencial', 6, CURDATE() + INTERVAL 1 DAY, '14:00', '15:00', 'Cerrada'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Estudios Sociales'
  WHERE u.correo = 'luis.menjivar@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Repaso de geografía de Centroamérica');
INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin, estado)
  SELECT tu.id_tutor, m.id_materia, 'Taller de JavaScript básico', 'Variables, funciones y eventos.', 'Virtual', 8, CURDATE() + INTERVAL 14 DAY, '16:00', '17:30', 'Cancelada'
  FROM tutores tu JOIN usuarios u ON u.id_usuario = tu.id_usuario JOIN materias m ON m.nombre = 'Informática'
  WHERE u.correo = 'carlos.ramirez@example.com'
    AND NOT EXISTS (SELECT 1 FROM tutorias z WHERE z.id_tutor = tu.id_tutor AND z.titulo = 'Taller de JavaScript básico');

-- ---------- Solicitudes de los estudiantes ----------
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Necesito repasar ecuaciones de segundo grado.', NOW() - INTERVAL 1 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Repaso de ecuaciones y álgebra'
  WHERE ue.correo = 'camila.rivas@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 6 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Repaso de ecuaciones y álgebra'
  WHERE ue.correo = 'daniel.portillo@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 11 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Repaso de ecuaciones y álgebra'
  WHERE ue.correo = 'valeria.guzman@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'No entendí la factorización.', NOW() - INTERVAL 16 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Repaso de ecuaciones y álgebra'
  WHERE ue.correo = 'kevin.orellana@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', 'Me cuesta la velocidad media.', NOW() - INTERVAL 21 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Cinemática: movimiento rectilíneo'
  WHERE ue.correo = 'diego.chavez@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 26 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Cinemática: movimiento rectilíneo'
  WHERE ue.correo = 'genesis.torres@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Rechazada', NULL, NOW() - INTERVAL 31 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Cinemática: movimiento rectilíneo'
  WHERE ue.correo = 'marvin.alvarado@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Tengo examen la próxima semana.', NOW() - INTERVAL 36 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Preparación de examen de trigonometría'
  WHERE ue.correo = 'daniela.reyes@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 41 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Preparación de examen de trigonometría'
  WHERE ue.correo = 'jonathan.salazar@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 46 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Preparación de examen de trigonometría'
  WHERE ue.correo = 'alison.campos@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Cancelada', 'Ya no puedo asistir ese día.', NOW() - INTERVAL 51 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'ana.martinez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Preparación de examen de trigonometría'
  WHERE ue.correo = 'bryan.mendoza@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 56 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Introducción a HTML y CSS'
  WHERE ue.correo = 'camila.rivas@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Quiero aprender a hacer mi primera página.', NOW() - INTERVAL 61 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Introducción a HTML y CSS'
  WHERE ue.correo = 'fatima.aguilar@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 66 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Introducción a HTML y CSS'
  WHERE ue.correo = 'emerson.ayala@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Es para mi proyecto de informática.', NOW() - INTERVAL 71 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Introducción a HTML y CSS'
  WHERE ue.correo = 'ximena.navarro@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Necesito entender las llaves foráneas.', NOW() - INTERVAL 4 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Bases de datos con MySQL'
  WHERE ue.correo = 'jonathan.salazar@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 9 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Bases de datos con MySQL'
  WHERE ue.correo = 'rodrigo.escobar@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 14 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'carlos.ramirez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Bases de datos con MySQL'
  WHERE ue.correo = 'sofia.pineda@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 19 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'karla.hernandez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Redacción de ensayos'
  WHERE ue.correo = 'valeria.guzman@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', 'Ayuda con la introducción de mi ensayo.', NOW() - INTERVAL 24 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'karla.hernandez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Redacción de ensayos'
  WHERE ue.correo = 'paola.mejia@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 29 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'karla.hernandez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Redacción de ensayos'
  WHERE ue.correo = 'oscar.rodriguez@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 34 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'karla.hernandez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Análisis de textos literarios'
  WHERE ue.correo = 'melissa.vasquez@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', 'Tengo que analizar un cuento para la clase.', NOW() - INTERVAL 39 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'karla.hernandez@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Análisis de textos literarios'
  WHERE ue.correo = 'wilfredo.caceres@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 44 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'jose.flores@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'La célula y sus funciones'
  WHERE ue.correo = 'daniel.portillo@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 49 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'jose.flores@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'La célula y sus funciones'
  WHERE ue.correo = 'fatima.aguilar@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 54 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'jose.flores@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'La célula y sus funciones'
  WHERE ue.correo = 'ximena.navarro@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'No logro balancear las ecuaciones.', NOW() - INTERVAL 59 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'jose.flores@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Balanceo de ecuaciones químicas'
  WHERE ue.correo = 'alison.campos@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 64 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'jose.flores@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Balanceo de ecuaciones químicas'
  WHERE ue.correo = 'bryan.mendoza@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Rechazada', NULL, NOW() - INTERVAL 69 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'jose.flores@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Balanceo de ecuaciones químicas'
  WHERE ue.correo = 'daniela.reyes@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Quiero perder el miedo a hablar.', NOW() - INTERVAL 2 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'maria.cruz@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Conversación básica en inglés'
  WHERE ue.correo = 'kevin.orellana@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 7 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'maria.cruz@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Conversación básica en inglés'
  WHERE ue.correo = 'emerson.ayala@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 12 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'maria.cruz@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Conversación básica en inglés'
  WHERE ue.correo = 'diego.chavez@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 17 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'maria.cruz@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Gramática: tiempos verbales'
  WHERE ue.correo = 'genesis.torres@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Cancelada', NULL, NOW() - INTERVAL 22 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'maria.cruz@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Gramática: tiempos verbales'
  WHERE ue.correo = 'melissa.vasquez@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 27 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'luis.menjivar@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Historia de El Salvador: siglo XX'
  WHERE ue.correo = 'marvin.alvarado@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', 'Me interesa el tema de los Acuerdos de Paz.', NOW() - INTERVAL 32 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'luis.menjivar@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Historia de El Salvador: siglo XX'
  WHERE ue.correo = 'paola.mejia@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Pendiente', NULL, NOW() - INTERVAL 37 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'luis.menjivar@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Historia de El Salvador: siglo XX'
  WHERE ue.correo = 'wilfredo.caceres@example.com';
INSERT IGNORE INTO solicitudes (id_estudiante, id_tutoria, estado, comentario, fecha_solicitud)
  SELECT es.id_estudiante, tu.id_tutoria, 'Aceptada', NULL, NOW() - INTERVAL 42 HOUR
  FROM estudiantes es JOIN usuarios ue ON ue.id_usuario = es.id_usuario
  JOIN usuarios ut ON ut.correo = 'luis.menjivar@example.com' JOIN tutores tr ON tr.id_usuario = ut.id_usuario
  JOIN tutorias tu ON tu.id_tutor = tr.id_tutor AND tu.titulo = 'Repaso de geografía de Centroamérica'
  WHERE ue.correo = 'oscar.rodriguez@example.com';

-- ---------- Resumen: cantidad de registros ----------
SELECT 'usuarios' AS tabla, COUNT(*) AS total FROM usuarios
UNION ALL SELECT 'estudiantes', COUNT(*) FROM estudiantes
UNION ALL SELECT 'tutores', COUNT(*) FROM tutores
UNION ALL SELECT 'materias', COUNT(*) FROM materias
UNION ALL SELECT 'tutor_materia', COUNT(*) FROM tutor_materia
UNION ALL SELECT 'disponibilidades', COUNT(*) FROM disponibilidades
UNION ALL SELECT 'tutorias', COUNT(*) FROM tutorias
UNION ALL SELECT 'solicitudes', COUNT(*) FROM solicitudes;

-- ---------- Cuentas de ejemplo (contraseña: Demo1234) ----------
-- TUTORES
--   ana.martinez@example.com  (Matemática y Física)
--   carlos.ramirez@example.com  (Informática y programación)
--   karla.hernandez@example.com  (Lenguaje y Literatura)
--   jose.flores@example.com  (Ciencias Naturales y Química)
--   maria.cruz@example.com  (Inglés)
--   luis.menjivar@example.com  (Estudios Sociales)
-- ESTUDIANTES
--   camila.rivas@example.com  (Primer año A)
--   daniel.portillo@example.com  (Primer año A)
--   valeria.guzman@example.com  (Primer año B)
--   kevin.orellana@example.com  (Primer año B)
--   fatima.aguilar@example.com  (Primer año C)
--   diego.chavez@example.com  (Segundo año A)
--   genesis.torres@example.com  (Segundo año A)
--   marvin.alvarado@example.com  (Segundo año B)
--   paola.mejia@example.com  (Segundo año B)
--   oscar.rodriguez@example.com  (Segundo año C)
--   daniela.reyes@example.com  (Tercer año A)
--   jonathan.salazar@example.com  (Tercer año A)
--   alison.campos@example.com  (Tercer año B)
--   bryan.mendoza@example.com  (Tercer año B)
--   sofia.pineda@example.com  (Tercer año C)
--   emerson.ayala@example.com  (Primer año C)
--   melissa.vasquez@example.com  (Segundo año C)
--   rodrigo.escobar@example.com  (Tercer año C)
--   ximena.navarro@example.com  (Primer año A)
--   wilfredo.caceres@example.com  (Segundo año A)
