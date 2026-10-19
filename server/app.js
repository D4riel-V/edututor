const path = require('path');
// Lee el archivo .env (solo existe en tu computadora; en Internet se usan las variables del hosting).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
// Hora de El Salvador para las fechas "de hoy" que valida el servidor.
process.env.TZ = process.env.TZ || 'America/El_Salvador';

const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const db = require('./config/db');
const { paginaProtegida } = require('./middlewares/auth');
const { manejadorErrores } = require('./utils/errores');
const { crearEsquema } = require('./utils/esquema');
const { iniciarDatos } = require('./utils/seed');

const produccion = process.env.NODE_ENV === 'production';
const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, '..', 'public');

app.disable('x-powered-by');
// Detrás del proxy del hosting (HTTPS) para que la cookie segura y la IP funcionen bien.
if (produccion) app.set('trust proxy', 1);

app.use(express.json());

let secreto = process.env.SESSION_SECRET;
if (!secreto) {
  secreto = produccion ? crypto.randomBytes(32).toString('hex') : 'edututor-clave-de-desarrollo';
  if (produccion) console.warn('AVISO: define SESSION_SECRET; sin ella las sesiones se cierran en cada reinicio.');
}

app.use(session({
  secret: secreto,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto', maxAge: 1000 * 60 * 60 * 4 } // 4 horas
}));

// ---- API ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/perfil', require('./routes/perfil'));
app.use('/api/materias', require('./routes/materias'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/disponibilidades', require('./routes/disponibilidades'));
app.use('/api/tutorias', require('./routes/tutorias'));
app.use('/api/solicitudes', require('./routes/solicitudes'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// ---- Páginas protegidas por rol (se revisan antes de servir los archivos) ----
app.use('/estudiante', paginaProtegida('Estudiante'), express.static(path.join(PUBLIC, 'estudiante')));
app.use('/tutor', paginaProtegida('Tutor'), express.static(path.join(PUBLIC, 'tutor')));
app.use('/admin', paginaProtegida('Administrador'), express.static(path.join(PUBLIC, 'admin')));
app.get('/perfil.html', paginaProtegida(), (req, res) => res.sendFile(path.join(PUBLIC, 'perfil.html')));

// ---- Páginas y recursos públicos ----
app.use(express.static(PUBLIC));

app.use(manejadorErrores);

crearEsquema(db)
  .then(() => iniciarDatos(db))
  .then(() => {
    app.listen(PORT, () => {
      console.log(`EduTutor funcionando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('\nNo se pudo conectar con la base de datos MySQL.');
    console.error('Motivo:', err.code || err.message);
    console.error('Revisa que:');
    console.error('  1) MySQL esté encendido.');
    console.error('  2) La base de datos exista (en tu computadora: ejecuta database/edututor.sql en MySQL Workbench).');
    console.error('  3) Los datos DB_HOST, DB_USER, DB_PASSWORD y DB_NAME sean correctos (archivo .env o variables del hosting).\n');
    process.exit(1);
  });
