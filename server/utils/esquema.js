// Crea las tablas si no existen, usando el mismo script de database/edututor.sql.
// Así, en una base nueva (por ejemplo en la nube) no hay que ejecutar nada a mano.
const fs = require('fs');
const path = require('path');

async function crearEsquema(pool) {
  const ruta = path.join(__dirname, '..', '..', 'database', 'edututor.sql');
  const sql = fs.readFileSync(ruta, 'utf8');
  const sentencias = sql
    .split('\n')
    .filter((linea) => !linea.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !/^(CREATE DATABASE|USE)\b/i.test(s));

  for (const sentencia of sentencias) {
    await pool.query(sentencia);
  }
}

module.exports = { crearEsquema };
