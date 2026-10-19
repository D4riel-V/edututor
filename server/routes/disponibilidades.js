const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();
router.use(requiereRol('Tutor'));

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORA = /^\d{2}:\d{2}(:\d{2})?$/;

function validar(b) {
  const d = { dia: String(b.dia_semana || ''), inicio: String(b.hora_inicio || ''), fin: String(b.hora_fin || '') };
  if (!DIAS.includes(d.dia)) throw new ApiError(400, 'Selecciona un día de la semana.');
  if (!HORA.test(d.inicio) || !HORA.test(d.fin)) throw new ApiError(400, 'Escribe la hora de inicio y de fin.');
  if (d.fin.slice(0, 5) <= d.inicio.slice(0, 5)) throw new ApiError(400, 'La hora de fin debe ser mayor que la de inicio.');
  return d;
}

router.get('/', ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT id_disponibilidad, dia_semana, hora_inicio, hora_fin FROM disponibilidades
     WHERE id_tutor = ? ORDER BY FIELD(dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), hora_inicio`,
    [req.session.usuario.idPerfil]
  );
  res.json({ disponibilidades: filas });
}));

router.post('/', ah(async (req, res) => {
  const d = validar(req.body);
  await db.query('INSERT INTO disponibilidades (id_tutor, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)',
    [req.session.usuario.idPerfil, d.dia, d.inicio, d.fin]);
  res.status(201).json({ mensaje: 'Horario agregado.' });
}));

router.put('/:id', ah(async (req, res) => {
  const d = validar(req.body);
  const [r] = await db.query(
    'UPDATE disponibilidades SET dia_semana = ?, hora_inicio = ?, hora_fin = ? WHERE id_disponibilidad = ? AND id_tutor = ?',
    [d.dia, d.inicio, d.fin, req.params.id, req.session.usuario.idPerfil]
  );
  if (!r.affectedRows) throw new ApiError(404, 'El horario no existe.');
  res.json({ mensaje: 'Horario actualizado.' });
}));

router.delete('/:id', ah(async (req, res) => {
  const [r] = await db.query('DELETE FROM disponibilidades WHERE id_disponibilidad = ? AND id_tutor = ?',
    [req.params.id, req.session.usuario.idPerfil]);
  if (!r.affectedRows) throw new ApiError(404, 'El horario no existe.');
  res.json({ mensaje: 'Horario eliminado.' });
}));

module.exports = router;
