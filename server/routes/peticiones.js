// Peticiones de materias nuevas: el tutor las pide y el administrador las revisa.
const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();
const MAX_PENDIENTES = 3;

// ---------- Tutor ----------
router.get('/mias', requiereRol('Tutor'), ah(async (req, res) => {
  const [filas] = await db.query(
    'SELECT id_peticion, nombre, estado, fecha_peticion FROM peticiones_materia WHERE id_tutor = ? ORDER BY id_peticion DESC LIMIT 10',
    [req.session.usuario.idPerfil]);
  res.json({ peticiones: filas });
}));

router.post('/', requiereRol('Tutor'), ah(async (req, res) => {
  const nombre = String(req.body.nombre || '').trim().replace(/\s+/g, ' ');
  const idTutor = req.session.usuario.idPerfil;
  if (!nombre) throw new ApiError(400, 'Escribe el nombre de la materia.');
  if (nombre.length > 80) throw new ApiError(400, 'El nombre de la materia es demasiado largo (máximo 80 caracteres).');

  const [existe] = await db.query('SELECT id_materia FROM materias WHERE nombre = ?', [nombre]);
  if (existe.length) throw new ApiError(409, 'Esa materia ya existe. Elígela de la lista.');
  const [pend] = await db.query("SELECT nombre FROM peticiones_materia WHERE id_tutor = ? AND estado = 'Pendiente'", [idTutor]);
  if (pend.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) throw new ApiError(409, 'Ya pediste esa materia. Espera la respuesta del administrador.');
  if (pend.length >= MAX_PENDIENTES) throw new ApiError(400, `Ya tienes ${MAX_PENDIENTES} peticiones pendientes. Espera a que el administrador las revise.`);

  await db.query('INSERT INTO peticiones_materia (id_tutor, nombre) VALUES (?, ?)', [idTutor, nombre]);
  res.status(201).json({ mensaje: 'Petición enviada. El administrador la revisará.' });
}));

// ---------- Administrador ----------
router.get('/', requiereRol('Administrador'), ah(async (req, res) => {
  const [filas] = await db.query(
    `SELECT p.id_peticion, p.nombre, p.estado, p.fecha_peticion, p.fecha_resolucion,
            CONCAT(u.nombre, ' ', u.apellido) AS tutor, u.correo
     FROM peticiones_materia p
     JOIN tutores t ON t.id_tutor = p.id_tutor
     JOIN usuarios u ON u.id_usuario = t.id_usuario
     ORDER BY (p.estado = 'Pendiente') DESC, p.id_peticion DESC LIMIT 50`);
  res.json({ peticiones: filas, pendientes: filas.filter((f) => f.estado === 'Pendiente').length });
}));

// Aprueba: crea la materia (o usa la que ya exista), se la asigna al tutor y a quien pidió lo mismo.
router.put('/:id/aprobar', requiereRol('Administrador'), ah(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[p]] = await conn.query("SELECT * FROM peticiones_materia WHERE id_peticion = ? AND estado = 'Pendiente' FOR UPDATE", [req.params.id]);
    if (!p) throw new ApiError(404, 'La petición no existe o ya fue resuelta.');
    const nombre = String(req.body.nombre || p.nombre).trim().replace(/\s+/g, ' ');
    if (!nombre || nombre.length > 80) throw new ApiError(400, 'El nombre de la materia no es válido.');

    let [m] = await conn.query('SELECT id_materia, nombre FROM materias WHERE nombre = ?', [nombre]);
    if (!m.length) {
      const [r] = await conn.query('INSERT INTO materias (nombre) VALUES (?)', [nombre]);
      m = [{ id_materia: r.insertId, nombre }];
    }
    const [iguales] = await conn.query("SELECT id_peticion, id_tutor FROM peticiones_materia WHERE estado = 'Pendiente' AND (id_peticion = ? OR nombre = ?)", [p.id_peticion, p.nombre]);
    for (const x of iguales) {
      await conn.query('INSERT IGNORE INTO tutor_materia (id_tutor, id_materia) VALUES (?, ?)', [x.id_tutor, m[0].id_materia]);
      await conn.query("UPDATE tutores SET especialidad = ? WHERE id_tutor = ? AND (especialidad IS NULL OR especialidad = '')", [m[0].nombre, x.id_tutor]);
      await conn.query("UPDATE peticiones_materia SET estado = 'Aprobada', fecha_resolucion = NOW() WHERE id_peticion = ?", [x.id_peticion]);
    }
    await conn.commit();
    res.json({ mensaje: `Materia "${m[0].nombre}" aprobada y asignada a ${iguales.length} tutor(es).` });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}));

router.put('/:id/rechazar', requiereRol('Administrador'), ah(async (req, res) => {
  const [r] = await db.query("UPDATE peticiones_materia SET estado = 'Rechazada', fecha_resolucion = NOW() WHERE id_peticion = ? AND estado = 'Pendiente'", [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'La petición no existe o ya fue resuelta.');
  res.json({ mensaje: 'Petición rechazada.' });
}));

module.exports = router;
