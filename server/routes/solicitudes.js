const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();

// ---------- Estudiante: solicitar una tutoría ----------
router.post('/', requiereRol('Estudiante'), ah(async (req, res) => {
  const idTutoria = Number(req.body.id_tutoria);
  const comentario = String(req.body.comentario || '').trim().slice(0, 255) || null;
  const idEst = req.session.usuario.idPerfil;
  if (!Number.isInteger(idTutoria)) throw new ApiError(400, 'Tutoría no válida.');

  const [t] = await db.query(
    `SELECT t.cupo, t.estado, t.fecha >= CURDATE() AS vigente,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Aceptada') AS aceptadas
     FROM tutorias t WHERE t.id_tutoria = ?`, [idTutoria]);
  if (!t.length) throw new ApiError(404, 'La tutoría no existe.');
  if (t[0].estado !== 'Activa' || !t[0].vigente) throw new ApiError(400, 'Esta tutoría ya no está disponible.');
  if (t[0].aceptadas >= t[0].cupo) throw new ApiError(400, 'Esta tutoría ya no tiene cupo disponible.');

  const [previa] = await db.query('SELECT id_solicitud, estado FROM solicitudes WHERE id_estudiante = ? AND id_tutoria = ?', [idEst, idTutoria]);
  if (previa.length) {
    if (previa[0].estado === 'Cancelada') {
      await db.query("UPDATE solicitudes SET estado = 'Pendiente', comentario = ?, fecha_solicitud = NOW() WHERE id_solicitud = ?", [comentario, previa[0].id_solicitud]);
      return res.json({ mensaje: 'Solicitud enviada.' });
    }
    throw new ApiError(409, 'Ya solicitaste esta tutoría.');
  }
  await db.query('INSERT INTO solicitudes (id_estudiante, id_tutoria, comentario) VALUES (?, ?, ?)', [idEst, idTutoria, comentario]);
  res.status(201).json({ mensaje: 'Solicitud enviada. El tutor la revisará pronto.' });
}));

// ---------- Estudiante: sus solicitudes ----------
router.get('/mias', requiereRol('Estudiante'), ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT s.id_solicitud, s.estado, s.comentario, s.fecha_solicitud,
            t.titulo, t.fecha, t.hora_inicio, t.hora_fin, t.modalidad,
            m.nombre AS materia, CONCAT(u.nombre, ' ', u.apellido) AS tutor
     FROM solicitudes s
     JOIN tutorias t ON t.id_tutoria = s.id_tutoria
     JOIN materias m ON m.id_materia = t.id_materia
     JOIN tutores tu ON tu.id_tutor = t.id_tutor
     JOIN usuarios u ON u.id_usuario = tu.id_usuario
     WHERE s.id_estudiante = ? ORDER BY s.fecha_solicitud DESC`,
    [req.session.usuario.idPerfil]
  );
  res.json({ solicitudes: filas });
}));

router.put('/:id/cancelar', requiereRol('Estudiante'), ah(async (req, res) => {
  const [r] = await db.query(
    "UPDATE solicitudes SET estado = 'Cancelada' WHERE id_solicitud = ? AND id_estudiante = ? AND estado IN ('Pendiente', 'Aceptada')",
    [req.params.id, req.session.usuario.idPerfil]
  );
  if (!r.affectedRows) throw new ApiError(400, 'No se puede cancelar esta solicitud.');
  res.json({ mensaje: 'Solicitud cancelada.' });
}));

// ---------- Tutor: solicitudes recibidas ----------
router.get('/recibidas', requiereRol('Tutor'), ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT s.id_solicitud, s.estado, s.comentario, s.fecha_solicitud,
            t.titulo, t.fecha, t.hora_inicio, t.hora_fin, t.cupo, m.nombre AS materia,
            CONCAT(u.nombre, ' ', u.apellido) AS estudiante, u.correo AS correo_estudiante, e.grado, e.seccion
     FROM solicitudes s
     JOIN tutorias t ON t.id_tutoria = s.id_tutoria
     JOIN materias m ON m.id_materia = t.id_materia
     JOIN estudiantes e ON e.id_estudiante = s.id_estudiante
     JOIN usuarios u ON u.id_usuario = e.id_usuario
     WHERE t.id_tutor = ?
     ORDER BY FIELD(s.estado, 'Pendiente', 'Aceptada', 'Rechazada', 'Cancelada'), s.fecha_solicitud DESC`,
    [req.session.usuario.idPerfil]
  );
  res.json({ solicitudes: filas });
}));

router.put('/:id/responder', requiereRol('Tutor'), ah(async (req, res) => {
  const nuevo = String(req.body.estado || '');
  if (!['Aceptada', 'Rechazada'].includes(nuevo)) throw new ApiError(400, 'Respuesta no válida.');

  const [f] = await db.query(
    `SELECT s.estado, t.id_tutoria, t.cupo FROM solicitudes s
     JOIN tutorias t ON t.id_tutoria = s.id_tutoria
     WHERE s.id_solicitud = ? AND t.id_tutor = ?`,
    [req.params.id, req.session.usuario.idPerfil]
  );
  if (!f.length) throw new ApiError(404, 'La solicitud no existe.');
  if (f[0].estado !== 'Pendiente') throw new ApiError(400, 'Esta solicitud ya fue respondida o cancelada.');

  if (nuevo === 'Aceptada') {
    const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM solicitudes WHERE id_tutoria = ? AND estado = 'Aceptada'", [f[0].id_tutoria]);
    if (n >= f[0].cupo) throw new ApiError(400, 'La tutoría ya alcanzó su cupo. No se pueden aceptar más solicitudes.');
  }
  await db.query('UPDATE solicitudes SET estado = ? WHERE id_solicitud = ?', [nuevo, req.params.id]);
  res.json({ mensaje: nuevo === 'Aceptada' ? 'Solicitud aceptada.' : 'Solicitud rechazada.' });
}));

module.exports = router;
