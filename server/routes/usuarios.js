const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');
const { validarUsuarioNuevo, crearUsuario } = require('../utils/usuarios');

const router = express.Router();
router.use(requiereRol('Administrador'));

router.get('/', ah(async (req, res) => {
  const { rol, q } = req.query;
  const params = [];
  let where = '1=1';
  if (rol) { where += ' AND r.nombre = ?'; params.push(rol); }
  if (q) {
    where += " AND (CONCAT(u.nombre, ' ', u.apellido) LIKE ? OR u.correo LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  const [filas] = await db.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.estado, u.fecha_registro, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
     WHERE ${where} ORDER BY u.fecha_registro DESC, u.id_usuario DESC`,
    params
  );
  res.json({ usuarios: filas });
}));

router.post('/', ah(async (req, res) => {
  const datos = validarUsuarioNuevo(req.body, ['Administrador', 'Tutor', 'Estudiante']);
  const id = await crearUsuario(db, datos);
  res.status(201).json({ id_usuario: id, mensaje: 'Usuario creado.' });
}));

router.put('/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const nombre = String(req.body.nombre || '').trim();
  const apellido = String(req.body.apellido || '').trim();
  const estado = req.body.estado ? 1 : 0;
  if (!nombre || !apellido) throw new ApiError(400, 'El nombre y el apellido son obligatorios.');
  if (id === req.session.usuario.id && !estado) throw new ApiError(400, 'No puedes desactivar tu propia cuenta.');
  const [r] = await db.query('UPDATE usuarios SET nombre = ?, apellido = ?, estado = ? WHERE id_usuario = ?', [nombre, apellido, estado, id]);
  if (!r.affectedRows) throw new ApiError(404, 'El usuario no existe.');
  res.json({ mensaje: 'Usuario actualizado.' });
}));

router.delete('/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.usuario.id) throw new ApiError(400, 'No puedes eliminar tu propia cuenta.');
  const [r] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
  if (!r.affectedRows) throw new ApiError(404, 'El usuario no existe.');
  res.json({ mensaje: 'Usuario eliminado.' });
}));

module.exports = router;
