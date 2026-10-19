// Protección de rutas y funciones según sesión y rol.

function requiereLogin(req, res, next) {
  if (!req.session.usuario) return res.status(401).json({ error: 'Debes iniciar sesión.' });
  next();
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.session.usuario) return res.status(401).json({ error: 'Debes iniciar sesión.' });
    if (!roles.includes(req.session.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  };
}

// Protege páginas HTML: si no hay sesión o el rol no corresponde, redirige al inicio.
function paginaProtegida(...roles) {
  return (req, res, next) => {
    const u = req.session.usuario;
    if (!u || (roles.length && !roles.includes(u.rol))) return res.redirect('/index.html');
    next();
  };
}

module.exports = { requiereLogin, requiereRol, paginaProtegida };
