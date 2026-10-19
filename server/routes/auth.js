const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ApiError, ah } = require('../utils/errores');
const { validarUsuarioNuevo, crearUsuario, datosDeSesion } = require('../utils/usuarios');
const limite = require('../utils/limite');
const { cerrarOtrasSesiones } = require('../utils/sesiones');

const router = express.Router();

// Registro público: solo estudiantes y tutores.
router.post('/registro', ah(async (req, res) => {
  const datos = validarUsuarioNuevo(req.body, ['Estudiante', 'Tutor']);
  if (datos.rol === 'Tutor' && !datos.especialidad && !datos.materiaSolicitada) throw new ApiError(400, 'Elige tu especialidad o escribe la materia que necesitas.');
  if (datos.especialidad) datos.materiaSolicitada = '';
  const id = await crearUsuario(db, datos);
  // Entra directamente al sistema, sin pedir otro inicio de sesión.
  const usuario = await datosDeSesion(db, { id_usuario: id, nombre: datos.nombre, apellido: datos.apellido, correo: datos.correo, rol: datos.rol });
  await new Promise((ok, fallo) => req.session.regenerate((e) => (e ? fallo(e) : ok())));
  req.session.usuario = usuario;
  res.status(201).json({ usuario, mensaje: 'Cuenta creada correctamente.' });
}));

router.post('/login', ah(async (req, res) => {
  const correo = String(req.body.correo || '').trim().toLowerCase();
  const contrasena = String(req.body.contrasena || '');
  if (!correo || !contrasena) throw new ApiError(400, 'Escribe tu correo y tu contraseña.');
  if (limite.bloqueado(req)) {
    throw new ApiError(429, 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.');
  }

  const [filas] = await db.query(
    'SELECT u.*, r.nombre AS rol FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE u.correo = ?',
    [correo]
  );
  const u = filas[0];
  const ok = u && (await bcrypt.compare(contrasena, u.contrasena_hash));
  if (!ok) {
    limite.registrarFallo(req);
    throw new ApiError(401, 'Correo o contraseña incorrectos.');
  }
  if (!u.estado) throw new ApiError(403, 'Tu cuenta está desactivada. Contacta al administrador.');

  limite.limpiar(req);
  req.session.usuario = await datosDeSesion(db, u);
  res.json({ usuario: req.session.usuario });
}));

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ mensaje: 'Sesión cerrada.' });
  });
});

// Cierra la sesión de este usuario en todos los demás dispositivos.
router.post('/cerrar-otras', (req, res, next) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'Debes iniciar sesión.' });
  cerrarOtrasSesiones(req).then((n) => res.json({ mensaje: n ? `Se cerraron ${n} sesión(es) en otros dispositivos.` : 'No había sesiones abiertas en otros dispositivos.' })).catch(next);
});

router.get('/me', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'Debes iniciar sesión.' });
  res.json({ usuario: req.session.usuario });
});

module.exports = router;
