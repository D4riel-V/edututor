// Error controlado con código HTTP y mensaje claro para el usuario (RNF09).
class ApiError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// Permite usar async/await en las rutas sin repetir try/catch.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Manejador central de errores.
function manejadorErrores(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof ApiError) return res.status(err.status).json({ error: err.message });
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      error: 'No se puede eliminar porque tiene información relacionada. Puedes desactivarlo en su lugar.'
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Los datos enviados no son válidos.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo.' });
}

module.exports = { ApiError, ah, manejadorErrores };
