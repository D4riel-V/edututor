const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { requiereLogin } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');
const limite = require('../utils/limite');
const { cerrarOtrasSesiones } = require('../utils/sesiones');

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

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE usuarios SET nombre = ?, apellido = ? WHERE id_usuario = ?', [nombre, apellido, s.id]);

    if (s.rol === 'Estudiante') {
      await conn.query('UPDATE estudiantes SET grado = ?, seccion = ?, telefono = ? WHERE id_estudiante = ?',
        [String(b.grado || '').trim() || null, String(b.seccion || '').trim() || null, String(b.telefono || '').trim() || null, s.idPerfil]);
    } else if (s.rol === 'Tutor') {
      // La especialidad debe ser una materia de la lista (o el valor que ya tenía guardado).
      const esp = String(b.especialidad || '').trim();
      let idEsp = null;
      if (esp) {
        const [m] = await conn.query('SELECT id_materia FROM materias WHERE nombre = ?', [esp]);
        const [[actual]] = await conn.query('SELECT especialidad FROM tutores WHERE id_tutor = ?', [s.idPerfil]);
        if (m.length) idEsp = m[0].id_materia;
        else if (actual.especialidad !== esp) throw new ApiError(400, 'Elige una especialidad de la lista.');
      }
      await conn.query('UPDATE tutores SET especialidad = ?, descripcion = ?, telefono = ? WHERE id_tutor = ?',
        [esp || null, String(b.descripcion || '').trim() || null, String(b.telefono || '').trim() || null, s.idPerfil]);

      // Materias que puede impartir el tutor (incluye siempre su especialidad).
      const ids = Array.isArray(b.materias) ? [...new Set(b.materias.map(Number).filter(Number.isInteger))] : [];
      if (idEsp && !ids.includes(idEsp)) ids.push(idEsp);
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

// Cambio de contraseña: exige la contraseña actual y limita los intentos.
router.put('/contrasena', ah(async (req, res) => {
  const s = req.session.usuario;
  const clave = `pw:${s.id}`;
  const actual = String(req.body.contrasenaActual || '');
  const nueva = String(req.body.nuevaContrasena || '');
  if (!actual) throw new ApiError(400, 'Escribe tu contraseña actual.');
  if (limite.bloqueado(req, clave)) throw new ApiError(429, 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.');
  if (nueva.length < 6) throw new ApiError(400, 'La nueva contraseña debe tener al menos 6 caracteres.');
  if (nueva.length > 72) throw new ApiError(400, 'La nueva contraseña es demasiado larga (máximo 72 caracteres).');

  const [[u]] = await db.query('SELECT contrasena_hash FROM usuarios WHERE id_usuario = ?', [s.id]);
  if (!(await bcrypt.compare(actual, u.contrasena_hash))) {
    limite.registrarFallo(req, clave);
    throw new ApiError(400, 'La contraseña actual no es correcta.');
  }
  if (actual === nueva) throw new ApiError(400, 'La nueva contraseña debe ser distinta de la actual.');

  limite.limpiar(req, clave);
  await db.query('UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?', [await bcrypt.hash(nueva, 10), s.id]);

  // Cierra las sesiones abiertas en otros dispositivos y renueva la actual.
  const cerradas = await cerrarOtrasSesiones(req);
  const datos = req.session.usuario;
  await new Promise((ok, fallo) => req.session.regenerate((e) => (e ? fallo(e) : ok())));
  req.session.usuario = datos;
  res.json({ mensaje: cerradas ? `Contraseña actualizada. Se cerró tu sesión en ${cerradas} otro(s) dispositivo(s).` : 'Contraseña actualizada.' });
}));

module.exports = router;
