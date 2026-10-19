// Cierra las demás sesiones abiertas del mismo usuario (el almacén de sesiones es la memoria del servidor).
function cerrarOtrasSesiones(req) {
  const store = req.sessionStore;
  const idUsuario = req.session.usuario.id;
  const actual = req.sessionID;
  return new Promise((resolve, reject) => {
    if (!store || typeof store.all !== 'function') return resolve(0);
    store.all((err, sesiones) => {
      if (err) return reject(err);
      const lista = Array.isArray(sesiones) ? sesiones.map((s, i) => [s && s.id, s]) : Object.entries(sesiones || {});
      const ids = lista.filter(([sid, s]) => sid !== actual && s && s.usuario && s.usuario.id === idUsuario).map(([sid]) => sid);
      let pendientes = ids.length;
      if (!pendientes) return resolve(0);
      ids.forEach((sid) => store.destroy(sid, () => { if (--pendientes === 0) resolve(ids.length); }));
    });
  });
}

module.exports = { cerrarOtrasSesiones };
