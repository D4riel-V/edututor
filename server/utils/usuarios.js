const bcrypt = require('bcryptjs');
const { ApiError } = require('./errores');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida los datos de un usuario nuevo y devuelve los datos limpios.
function validarUsuarioNuevo(d, rolesPermitidos) {
  const limpio = {
    nombre: String(d.nombre || '').trim(),
    apellido: String(d.apellido || '').trim(),
    correo: String(d.correo || '').trim().toLowerCase(),
    contrasena: String(d.contrasena || ''),
    rol: String(d.rol || ''),
    grado: String(d.grado || '').trim(),
    seccion: String(d.seccion || '').trim(),
    telefono: String(d.telefono || '').trim(),
    especialidad: String(d.especialidad || '').trim(),
    materiaSolicitada: String(d.materiaSolicitada || '').trim()
  };
  if (!limpio.nombre || !limpio.apellido) throw new ApiError(400, 'El nombre y el apellido son obligatorios.');
  if (limpio.nombre.length > 60 || limpio.apellido.length > 60) throw new ApiError(400, 'El nombre o el apellido es demasiado largo.');
  if (!EMAIL.test(limpio.correo)) throw new ApiError(400, 'Escribe un correo válido.');
  if (limpio.correo.length > 100) throw new ApiError(400, 'El correo es demasiado largo.');
  if (limpio.contrasena.length < 6) throw new ApiError(400, 'La contraseña debe tener al menos 6 caracteres.');
  if (limpio.materiaSolicitada.length > 80) throw new ApiError(400, 'El nombre de la materia es demasiado largo (máximo 80 caracteres).');
  if (!rolesPermitidos.includes(limpio.rol)) throw new ApiError(400, 'El tipo de usuario no es válido.');
  return limpio;
}

// Crea el usuario y su perfil (estudiante o tutor) en una sola transacción.
async function crearUsuario(pool, d) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [roles] = await conn.query('SELECT id_rol FROM roles WHERE nombre = ?', [d.rol]);
    if (!roles.length) throw new ApiError(400, 'El tipo de usuario no es válido.');
    const hash = await bcrypt.hash(d.contrasena, 10);
    const [r] = await conn.query(
      'INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, id_rol) VALUES (?, ?, ?, ?, ?)',
      [d.nombre, d.apellido, d.correo, hash, roles[0].id_rol]
    );
    if (d.rol === 'Estudiante') {
      await conn.query('INSERT INTO estudiantes (id_usuario, grado, seccion, telefono) VALUES (?, ?, ?, ?)',
        [r.insertId, d.grado || null, d.seccion || null, d.telefono || null]);
    } else if (d.rol === 'Tutor') {
      let materia = null;
      if (d.especialidad) {
        const [m] = await conn.query('SELECT id_materia, nombre FROM materias WHERE nombre = ?', [d.especialidad]);
        if (!m.length) throw new ApiError(400, 'Elige una especialidad de la lista.');
        materia = m[0];
      }
      const [t] = await conn.query('INSERT INTO tutores (id_usuario, especialidad, telefono) VALUES (?, ?, ?)',
        [r.insertId, materia ? materia.nombre : null, d.telefono || null]);
      // La especialidad elegida también queda como materia que puede impartir.
      if (materia) await conn.query('INSERT INTO tutor_materia (id_tutor, id_materia) VALUES (?, ?)', [t.insertId, materia.id_materia]);
      // Si su materia no estaba en la lista, queda como petición para que el administrador la revise.
      if (!materia && d.materiaSolicitada) {
        await conn.query('INSERT INTO peticiones_materia (id_tutor, nombre) VALUES (?, ?)', [t.insertId, d.materiaSolicitada]);
      }
    }
    await conn.commit();
    return r.insertId;
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Ya existe una cuenta con ese correo.');
    throw e;
  } finally {
    conn.release();
  }
}

// Datos que se guardan en la sesión (incluye el id del perfil según el rol).
async function datosDeSesion(pool, u) {
  let idPerfil = null;
  if (u.rol === 'Estudiante') {
    const [f] = await pool.query('SELECT id_estudiante AS id FROM estudiantes WHERE id_usuario = ?', [u.id_usuario]);
    idPerfil = f.length ? f[0].id : null;
  } else if (u.rol === 'Tutor') {
    const [f] = await pool.query('SELECT id_tutor AS id FROM tutores WHERE id_usuario = ?', [u.id_usuario]);
    idPerfil = f.length ? f[0].id : null;
  }
  return { id: u.id_usuario, nombre: u.nombre, apellido: u.apellido, correo: u.correo, rol: u.rol, idPerfil };
}

module.exports = { validarUsuarioNuevo, crearUsuario, datosDeSesion };
