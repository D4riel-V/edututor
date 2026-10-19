const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}(:\d{2})?$/;

function hoy() {
  return new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD en la zona horaria del equipo
}

function validar(b, esEdicion) {
  const d = {
    id_materia: Number(b.id_materia),
    titulo: String(b.titulo || '').trim(),
    descripcion: String(b.descripcion || '').trim(),
    modalidad: String(b.modalidad || 'Presencial'),
    cupo: Number(b.cupo),
    fecha: String(b.fecha || ''),
    inicio: String(b.hora_inicio || ''),
    fin: String(b.hora_fin || ''),
    estado: String(b.estado || 'Activa')
  };
  if (!Number.isInteger(d.id_materia) || d.id_materia <= 0) throw new ApiError(400, 'Selecciona una materia.');
  if (!d.titulo) throw new ApiError(400, 'El título de la tutoría es obligatorio.');
  if (d.titulo.length > 100) throw new ApiError(400, 'El título es demasiado largo (máximo 100 caracteres).');
  if (!['Presencial', 'Virtual'].includes(d.modalidad)) throw new ApiError(400, 'La modalidad no es válida.');
  if (!Number.isInteger(d.cupo) || d.cupo < 1 || d.cupo > 50) throw new ApiError(400, 'El cupo debe ser un número entre 1 y 50.');
  if (!FECHA.test(d.fecha)) throw new ApiError(400, 'Escribe una fecha válida.');
  if (!esEdicion && d.fecha < hoy()) throw new ApiError(400, 'La fecha no puede ser anterior a hoy.');
  if (!HORA.test(d.inicio) || !HORA.test(d.fin)) throw new ApiError(400, 'Escribe la hora de inicio y de fin.');
  if (d.fin.slice(0, 5) <= d.inicio.slice(0, 5)) throw new ApiError(400, 'La hora de fin debe ser mayor que la de inicio.');
  if (!['Activa', 'Cerrada', 'Cancelada'].includes(d.estado)) throw new ApiError(400, 'El estado no es válido.');
  return d;
}

async function verificarMateriaDelTutor(idTutor, idMateria) {
  const [f] = await db.query('SELECT 1 FROM tutor_materia WHERE id_tutor = ? AND id_materia = ?', [idTutor, idMateria]);
  if (!f.length) throw new ApiError(400, 'No tienes esa materia en tu perfil. Agrégala primero en "Perfil".');
}

// ---------- Estudiante: buscar y filtrar ----------
router.get('/', requiereRol('Estudiante'), ah(async (req, res) => {
  const { q, materia, franja } = req.query;
  const params = [req.session.usuario.idPerfil];
  let where = "t.estado = 'Activa' AND t.fecha >= CURDATE() AND tu_u.estado = 1";

  if (materia) { where += ' AND t.id_materia = ?'; params.push(Number(materia)); }
  if (q) {
    where += " AND (t.titulo LIKE ? OR m.nombre LIKE ? OR CONCAT(tu_u.nombre, ' ', tu_u.apellido) LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (franja === 'manana') where += " AND t.hora_inicio < '12:00:00'";
  if (franja === 'tarde') where += " AND t.hora_inicio >= '12:00:00'";

  const [filas] = await db.query(
    `SELECT t.id_tutoria, t.titulo, t.descripcion, t.modalidad, t.cupo, t.fecha, t.hora_inicio, t.hora_fin,
            m.nombre AS materia, CONCAT(tu_u.nombre, ' ', tu_u.apellido) AS tutor,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Aceptada') AS aceptadas,
            (SELECT s2.estado FROM solicitudes s2 WHERE s2.id_tutoria = t.id_tutoria AND s2.id_estudiante = ?) AS mi_estado
     FROM tutorias t
     JOIN materias m ON m.id_materia = t.id_materia
     JOIN tutores tu ON tu.id_tutor = t.id_tutor
     JOIN usuarios tu_u ON tu_u.id_usuario = tu.id_usuario
     WHERE ${where}
     ORDER BY t.fecha, t.hora_inicio`,
    params
  );
  res.json({ tutorias: filas });
}));

// ---------- Tutor: sus tutorías ----------
router.get('/mias', requiereRol('Tutor'), ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT t.id_tutoria, t.id_materia, t.titulo, t.descripcion, t.modalidad, t.cupo, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
            m.nombre AS materia,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Aceptada') AS aceptadas,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Pendiente') AS pendientes
     FROM tutorias t JOIN materias m ON m.id_materia = t.id_materia
     WHERE t.id_tutor = ? ORDER BY t.fecha DESC, t.hora_inicio`,
    [req.session.usuario.idPerfil]
  );
  res.json({ tutorias: filas });
}));

// ---------- Administrador: ver todas las tutorías ----------
router.get('/admin', requiereRol('Administrador'), ah(async (req, res) => {
  const { q, materia, estado, modalidad, desde, hasta } = req.query;
  const params = [];
  let where = '1=1';
  if (materia) { where += ' AND t.id_materia = ?'; params.push(Number(materia)); }
  if (['Activa', 'Cerrada', 'Cancelada'].includes(estado)) { where += ' AND t.estado = ?'; params.push(estado); }
  if (['Presencial', 'Virtual'].includes(modalidad)) { where += ' AND t.modalidad = ?'; params.push(modalidad); }
  if (FECHA.test(desde || '')) { where += ' AND t.fecha >= ?'; params.push(desde); }
  if (FECHA.test(hasta || '')) { where += ' AND t.fecha <= ?'; params.push(hasta); }
  if (q) {
    where += " AND (t.titulo LIKE ? OR m.nombre LIKE ? OR CONCAT(u.nombre, ' ', u.apellido) LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const [filas] = await db.query(
    `SELECT t.id_tutoria, t.titulo, t.modalidad, t.cupo, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
            m.nombre AS materia, CONCAT(u.nombre, ' ', u.apellido) AS tutor,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Aceptada') AS aceptadas,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Pendiente') AS pendientes,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Rechazada') AS rechazadas,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Cancelada') AS canceladas
     FROM tutorias t
     JOIN materias m ON m.id_materia = t.id_materia
     JOIN tutores tu ON tu.id_tutor = t.id_tutor
     JOIN usuarios u ON u.id_usuario = tu.id_usuario
     WHERE ${where}
     ORDER BY t.fecha DESC, t.hora_inicio DESC
     LIMIT 500`,
    params
  );
  res.json({ tutorias: filas });
}));

router.get('/admin/:id', requiereRol('Administrador'), ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT t.id_tutoria, t.titulo, t.descripcion, t.modalidad, t.cupo, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
            m.nombre AS materia, CONCAT(u.nombre, ' ', u.apellido) AS tutor, u.correo AS tutor_correo
     FROM tutorias t
     JOIN materias m ON m.id_materia = t.id_materia
     JOIN tutores tu ON tu.id_tutor = t.id_tutor
     JOIN usuarios u ON u.id_usuario = tu.id_usuario
     WHERE t.id_tutoria = ?`, [req.params.id]);
  if (!filas.length) throw new ApiError(404, 'La tutoría no existe.');
  const [solicitudes] = await db.query(
    `SELECT s.id_solicitud, s.estado, s.comentario, s.fecha_solicitud,
            CONCAT(u.nombre, ' ', u.apellido) AS estudiante, u.correo, e.grado, e.seccion
     FROM solicitudes s
     JOIN estudiantes e ON e.id_estudiante = s.id_estudiante
     JOIN usuarios u ON u.id_usuario = e.id_usuario
     WHERE s.id_tutoria = ? ORDER BY s.fecha_solicitud`, [req.params.id]);
  res.json({ tutoria: filas[0], solicitudes });
}));

// Cambia el estado de cualquier tutoría. Al cancelar, también se cancelan las solicitudes abiertas.
router.put('/admin/:id/estado', requiereRol('Administrador'), ah(async (req, res) => {
  const estado = String(req.body.estado || '');
  if (!['Activa', 'Cerrada', 'Cancelada'].includes(estado)) throw new ApiError(400, 'El estado no es válido.');
  const [r] = await db.query('UPDATE tutorias SET estado = ? WHERE id_tutoria = ?', [estado, req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'La tutoría no existe.');
  if (estado === 'Cancelada') {
    await db.query("UPDATE solicitudes SET estado = 'Cancelada' WHERE id_tutoria = ? AND estado IN ('Pendiente','Aceptada')", [req.params.id]);
  }
  res.json({ mensaje: `Tutoría marcada como ${estado.toLowerCase()}.` });
}));

// ---------- Estudiante: detalle de una tutoría y de su tutor ----------
router.get('/:id', requiereRol('Estudiante'), ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT t.id_tutoria, t.titulo, t.descripcion, t.modalidad, t.cupo, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
            m.nombre AS materia, CONCAT(u.nombre, ' ', u.apellido) AS tutor,
            tu.especialidad, tu.descripcion AS perfil_tutor,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Aceptada') AS aceptadas,
            (SELECT s2.estado FROM solicitudes s2 WHERE s2.id_tutoria = t.id_tutoria AND s2.id_estudiante = ?) AS mi_estado
     FROM tutorias t
     JOIN materias m ON m.id_materia = t.id_materia
     JOIN tutores tu ON tu.id_tutor = t.id_tutor
     JOIN usuarios u ON u.id_usuario = tu.id_usuario
     WHERE t.id_tutoria = ?`,
    [req.session.usuario.idPerfil, req.params.id]
  );
  if (!filas.length) throw new ApiError(404, 'La tutoría no existe.');
  res.json({ tutoria: filas[0] });
}));

// ---------- Tutor: crear, editar y eliminar ----------
router.post('/', requiereRol('Tutor'), ah(async (req, res) => {
  const d = validar(req.body, false);
  const idTutor = req.session.usuario.idPerfil;
  await verificarMateriaDelTutor(idTutor, d.id_materia);
  const [r] = await db.query(
    `INSERT INTO tutorias (id_tutor, id_materia, titulo, descripcion, modalidad, cupo, fecha, hora_inicio, hora_fin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [idTutor, d.id_materia, d.titulo, d.descripcion || null, d.modalidad, d.cupo, d.fecha, d.inicio, d.fin]
  );
  res.status(201).json({ id_tutoria: r.insertId, mensaje: 'Tutoría creada.' });
}));

router.put('/:id', requiereRol('Tutor'), ah(async (req, res) => {
  const d = validar(req.body, true);
  const idTutor = req.session.usuario.idPerfil;
  await verificarMateriaDelTutor(idTutor, d.id_materia);
  const [aceptadas] = await db.query("SELECT COUNT(*) AS n FROM solicitudes WHERE id_tutoria = ? AND estado = 'Aceptada'", [req.params.id]);
  if (d.cupo < aceptadas[0].n) throw new ApiError(400, `Ya hay ${aceptadas[0].n} solicitudes aceptadas; el cupo no puede ser menor.`);
  const [r] = await db.query(
    `UPDATE tutorias SET id_materia = ?, titulo = ?, descripcion = ?, modalidad = ?, cupo = ?, fecha = ?,
            hora_inicio = ?, hora_fin = ?, estado = ?
     WHERE id_tutoria = ? AND id_tutor = ?`,
    [d.id_materia, d.titulo, d.descripcion || null, d.modalidad, d.cupo, d.fecha, d.inicio, d.fin, d.estado, req.params.id, idTutor]
  );
  if (!r.affectedRows) throw new ApiError(404, 'La tutoría no existe.');
  res.json({ mensaje: 'Tutoría actualizada.' });
}));

router.delete('/:id', requiereRol('Tutor'), ah(async (req, res) => {
  const [r] = await db.query('DELETE FROM tutorias WHERE id_tutoria = ? AND id_tutor = ?', [req.params.id, req.session.usuario.idPerfil]);
  if (!r.affectedRows) throw new ApiError(404, 'La tutoría no existe.');
  res.json({ mensaje: 'Tutoría eliminada.' });
}));

module.exports = router;
