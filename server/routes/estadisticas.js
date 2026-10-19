const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ah } = require('../utils/errores');

const router = express.Router();

router.get('/', requiereRol('Administrador'), ah(async (req, res) => {
  const [[t]] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM usuarios) AS usuarios,
      (SELECT COUNT(*) FROM estudiantes) AS estudiantes,
      (SELECT COUNT(*) FROM tutores) AS tutores,
      (SELECT COUNT(*) FROM materias) AS materias,
      (SELECT COUNT(*) FROM tutorias) AS tutorias,
      (SELECT COUNT(*) FROM tutorias WHERE estado = 'Activa' AND fecha >= CURDATE()) AS tutorias_activas,
      (SELECT COUNT(*) FROM solicitudes) AS solicitudes`);
  const [porEstado] = await db.query('SELECT estado, COUNT(*) AS total FROM solicitudes GROUP BY estado');
  const [topMaterias] = await db.query(
    `SELECT m.nombre, COUNT(s.id_solicitud) AS solicitudes
     FROM materias m
     LEFT JOIN tutorias t ON t.id_materia = m.id_materia
     LEFT JOIN solicitudes s ON s.id_tutoria = t.id_tutoria
     GROUP BY m.id_materia, m.nombre
     ORDER BY solicitudes DESC, m.nombre LIMIT 5`);
  res.json({ totales: t, solicitudesPorEstado: porEstado, topMaterias });
}));

module.exports = router;
