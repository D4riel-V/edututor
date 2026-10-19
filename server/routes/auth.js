const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ApiError, ah } = require('../utils/errores');
const { validarUsuarioNuevo, crearUsuario, datosDeSesion } = require('../utils/usuarios');
const limite = require('../utils/limite');

const router = express.Router();

// Registro público: solo estudiantes y tutores.
router.post('/registro', ah(async (req, res) => {
  const datos = validarUsuarioNuevo(req.body, ['Estudiante', 'Tutor']);
  await crearUsuario(db, datos);
  res.status(201).json({ mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.' });
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

router.get('/me', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'Debes iniciar sesión.' });
  res.json({ usuario: req.session.usuario });
});

module.exports = router;
