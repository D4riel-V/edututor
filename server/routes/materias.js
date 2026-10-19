const express = require('express');
const db = require('../config/db');
const { requiereLogin, requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();

function validar(b) {
  const nombre = String(b.nombre || '').trim();
  const descripcion = String(b.descripcion || '').trim();
  if (!nombre) throw new ApiError(400, 'El nombre de la materia es obligatorio.');
  if (nombre.length > 80) throw new ApiError(400, 'El nombre de la materia es demasiado largo.');
  if (descripcion.length > 255) throw new ApiError(400, 'La descripción es demasiado larga (máximo 255 caracteres).');
  return { nombre, descripcion: descripcion || null };
}

router.get('/', requiereLogin, ah(async (req, res) => {
  const [filas] = await db.query('SELECT id_materia, nombre, descripcion FROM materias ORDER BY nombre');
  res.json({ materias: filas });
}));

router.post('/', requiereRol('Administrador'), ah(async (req, res) => {
  const d = validar(req.body);
  try {
    const [r] = await db.query('INSERT INTO materias (nombre, descripcion) VALUES (?, ?)', [d.nombre, d.descripcion]);
    res.status(201).json({ id_materia: r.insertId, mensaje: 'Materia creada.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Ya existe una materia con ese nombre.');
    throw e;
  }
}));

router.put('/:id', requiereRol('Administrador'), ah(async (req, res) => {
  const d = validar(req.body);
  try {
    const [r] = await db.query('UPDATE materias SET nombre = ?, descripcion = ? WHERE id_materia = ?', [d.nombre, d.descripcion, req.params.id]);
    if (!r.affectedRows) throw new ApiError(404, 'La materia no existe.');
    res.json({ mensaje: 'Materia actualizada.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Ya existe una materia con ese nombre.');
    throw e;
  }
}));

router.delete('/:id', requiereRol('Administrador'), ah(async (req, res) => {
  const [r] = await db.query('DELETE FROM materias WHERE id_materia = ?', [req.params.id]);
  if (!r.affectedRows) throw new ApiError(404, 'La materia no existe.');
  res.json({ mensaje: 'Materia eliminada.' });
}));

module.exports = router;
