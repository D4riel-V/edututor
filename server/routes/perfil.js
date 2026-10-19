const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { requiereLogin } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();
router.use(requiereLogin);

router.get('/', ah(async (req, res) => {
  const s = req.session.usuario;
  const [[u]] = await db.query('SELECT nombre, apellido, correo FROM usuarios WHERE id_usuario = ?', [s.id]);
  const perfil = { ...u, rol: s.rol };

  if (s.rol === 'Estudiante') {
    const [[e]] = await db.query('SELECT grado, seccion, telefono FROM estudiantes WHERE id_estudiante = ?', [s.idPerfil]);
    Object.assign(perfil, e);
  } else if (s.rol === 'Tutor') {
    const [[t]] = await db.query('SELECT especialidad, descripcion, telefono FROM tutores WHERE id_tutor = ?', [s.idPerfil]);
    Object.assign(perfil, t);
    const [m] = await db.query(
      'SELECT m.id_materia, m.nombre FROM tutor_materia tm JOIN materias m ON m.id_materia = tm.id_materia WHERE tm.id_tutor = ? ORDER BY m.nombre',
      [s.idPerfil]
    );
    perfil.materias = m;
  }
  res.json({ perfil });
}));

router.put('/', ah(async (req, res) => {
  const s = req.session.usuario;
  const b = req.body;
  const nombre = String(b.nombre || '').trim();
  const apellido = String(b.apellido || '').trim();
  if (!nombre || !apellido) throw new ApiError(400, 'El nombre y el apellido son obligatorios.');
  if (nombre.length > 60 || apellido.length > 60) throw new ApiError(400, 'El nombre o el apellido es demasiado largo.');

  const nueva = String(b.nuevaContrasena || '');
  if (nueva && nueva.length < 6) throw new ApiError(400, 'La nueva contraseña debe tener al menos 6 caracteres.');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE usuarios SET nombre = ?, apellido = ? WHERE id_usuario = ?', [nombre, apellido, s.id]);
    if (nueva) {
      const hash = await bcrypt.hash(nueva, 10);
      await conn.query('UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?', [hash, s.id]);
    }

    if (s.rol === 'Estudiante') {
      await conn.query('UPDATE estudiantes SET grado = ?, seccion = ?, telefono = ? WHERE id_estudiante = ?',
        [String(b.grado || '').trim() || null, String(b.seccion || '').trim() || null, String(b.telefono || '').trim() || null, s.idPerfil]);
    } else if (s.rol === 'Tutor') {
      await conn.query('UPDATE tutores SET especialidad = ?, descripcion = ?, telefono = ? WHERE id_tutor = ?',
        [String(b.especialidad || '').trim() || null, String(b.descripcion || '').trim() || null, String(b.telefono || '').trim() || null, s.idPerfil]);

      // Materias que puede impartir el tutor.
      const ids = Array.isArray(b.materias) ? [...new Set(b.materias.map(Number).filter(Number.isInteger))] : [];
      await conn.query('DELETE FROM tutor_materia WHERE id_tutor = ?', [s.idPerfil]);
      if (ids.length) {
        await conn.query('INSERT IGNORE INTO tutor_materia (id_tutor, id_materia) SELECT ?, id_materia FROM materias WHERE id_materia IN (?)',
          [s.idPerfil, ids]);
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  req.session.usuario.nombre = nombre;
  req.session.usuario.apellido = apellido;
  res.json({ mensaje: 'Perfil actualizado correctamente.' });
}));

module.exports = router;
