// Conexión a MySQL. Los datos se leen del archivo .env (en tu computadora)
// o de las variables de entorno del hosting (en Internet). No escribas contraseñas aquí.
const mysql = require('mysql2/promise');

const usarSsl = ['true', '1', 'yes'].includes(String(process.env.DB_SSL || '').toLowerCase());

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edututor',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true // fechas y horas como texto: '2026-10-20', '15:00:00'
};

// Las bases de datos en la nube exigen conexión cifrada (SSL).
if (usarSsl) {
  config.ssl = process.env.DB_CA ? { ca: process.env.DB_CA } : { rejectUnauthorized: false };
}

const pool = mysql.createPool(config);

// Hora de El Salvador (UTC-6, sin horario de verano) para NOW() y CURDATE().
const zona = /^[+-]\d{2}:\d{2}$/.test(process.env.DB_TIMEZONE || '') ? process.env.DB_TIMEZONE : '-06:00';
pool.pool.on('connection', (conn) => conn.query(`SET time_zone = '${zona}'`));

module.exports = pool;
