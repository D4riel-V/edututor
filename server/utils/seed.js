// Datos iniciales: roles, cuenta de administrador y materias de ejemplo.
const bcrypt = require('bcryptjs');

const produccion = process.env.NODE_ENV === 'production';

const ADMIN = {
  nombre: 'Administrador',
  apellido: 'EduTutor',
  correo: String(process.env.ADMIN_EMAIL || 'admin@edututor.com').trim().toLowerCase(),
  // En Internet NO se usa una contraseña por defecto: debe definirse ADMIN_PASSWORD.
  contrasena: process.env.ADMIN_PASSWORD || (produccion ? null : 'Admin123')
};

const MATERIAS = [
  ['Matemática', 'Álgebra, geometría, trigonometría y cálculo básico'],
  ['Lenguaje y Literatura', 'Redacción, ortografía y análisis de textos'],
  ['Ciencias Naturales', 'Biología, ecología y ciencias de la vida'],
  ['Estudios Sociales', 'Historia, geografía y cívica'],
  ['Inglés', 'Gramática, vocabulario y conversación'],
  ['Física', 'Mecánica, energía y electricidad'],
  ['Química', 'Materia, reacciones y formulación'],
  ['Informática', 'Programación, bases de datos y desarrollo web']
];

async function iniciarDatos(pool) {
  await pool.query("INSERT IGNORE INTO roles (nombre) VALUES ('Administrador'), ('Tutor'), ('Estudiante')");

  const [admins] = await pool.query(
    "SELECT u.id_usuario FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE r.nombre = 'Administrador' LIMIT 1"
  );
  if (!admins.length) {
    if (!ADMIN.contrasena || ADMIN.contrasena.length < 8) {
      console.warn('AVISO: no se creó la cuenta de administrador. Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres).');
    } else {
      const [[rol]] = await pool.query("SELECT id_rol FROM roles WHERE nombre = 'Administrador'");
      const hash = await bcrypt.hash(ADMIN.contrasena, 10);
      await pool.query(
        'INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, id_rol) VALUES (?, ?, ?, ?, ?)',
        [ADMIN.nombre, ADMIN.apellido, ADMIN.correo, hash, rol.id_rol]
      );
      console.log(produccion
        ? `Cuenta de administrador creada: ${ADMIN.correo}`
        : `Cuenta de administrador creada: ${ADMIN.correo} / ${ADMIN.contrasena}`);
    }
  }

  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM materias');
  if (total === 0) {
    await pool.query('INSERT INTO materias (nombre, descripcion) VALUES ?', [MATERIAS]);
    console.log('Materias de ejemplo creadas.');
  }
}

module.exports = { iniciarDatos };
