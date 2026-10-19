// Límite sencillo de intentos fallidos de inicio de sesión (protege contra adivinar contraseñas).
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 8;
const intentos = new Map();

const clave = (req) => `${req.ip}|${String(req.body.correo || '').trim().toLowerCase()}`;

function bloqueado(req) {
  const k = clave(req);
  const r = intentos.get(k);
  if (!r) return false;
  if (Date.now() - r.inicio > VENTANA_MS) {
    intentos.delete(k);
    return false;
  }
  return r.n >= MAX_INTENTOS;
}

function registrarFallo(req) {
  const k = clave(req);
  const r = intentos.get(k);
  if (!r || Date.now() - r.inicio > VENTANA_MS) intentos.set(k, { n: 1, inicio: Date.now() });
  else r.n += 1;
}

function limpiar(req) {
  intentos.delete(clave(req));
}

// Limpieza periódica para no acumular memoria.
setInterval(() => {
  const ahora = Date.now();
  for (const [k, r] of intentos) if (ahora - r.inicio > VENTANA_MS) intentos.delete(k);
}, VENTANA_MS).unref();

module.exports = { bloqueado, registrarFallo, limpiar };
