// Comunicación con el servidor (fetch). Devuelve el JSON o lanza un Error con mensaje claro.
async function api(url, opciones = {}) {
  const config = { method: opciones.method || 'GET', headers: {}, credentials: 'same-origin' };
  if (opciones.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(opciones.body);
  }

  let respuesta;
  try {
    respuesta = await fetch(url, config);
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Verifica que esté encendido.');
  }

  let datos = {};
  try { datos = await respuesta.json(); } catch (e) { /* respuesta sin cuerpo */ }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !opciones.sinRedirigir) {
      location.href = '/index.html';
      throw new Error('Debes iniciar sesión.');
    }
    const error = new Error(datos.error || 'Ocurrió un error. Intenta de nuevo.');
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}
