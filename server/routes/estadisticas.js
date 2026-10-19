const express = require('express');
const db = require('../config/db');
const { requiereRol } = require('../middlewares/auth');
const { ApiError, ah } = require('../utils/errores');

const router = express.Router();
router.use(requiereRol('Administrador'));

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Lee el rango de fechas opcional (?desde=AAAA-MM-DD&hasta=AAAA-MM-DD).
function rango(req) {
  const desde = String(req.query.desde || '');
  const hasta = String(req.query.hasta || '');
  if (desde && !FECHA.test(desde)) throw new ApiError(400, 'La fecha "desde" no es válida.');
  if (hasta && !FECHA.test(hasta)) throw new ApiError(400, 'La fecha "hasta" no es válida.');
  if (desde && hasta && desde > hasta) throw new ApiError(400, 'La fecha "desde" no puede ser mayor que "hasta".');
  return { desde, hasta };
}

// Arma "AND col >= ? AND col <= ?" para una columna de fecha.
function filtro(columna, { desde, hasta }) {
  const sql = [];
  const params = [];
  if (desde) { sql.push(`${columna} >= ?`); params.push(desde); }
  if (hasta) { sql.push(`${columna} <= ?`); params.push(hasta); }
  return { sql: sql.length ? ' AND ' + sql.join(' AND ') : '', params };
}

const porcentaje = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

router.get('/', ah(async (req, res) => {
  const r = rango(req);
  const fT = filtro('t.fecha', r);                       // tutorías por la fecha en que ocurren
  const fS = filtro('DATE(s.fecha_solicitud)', r);       // solicitudes por la fecha en que se hicieron
  const fU = filtro('DATE(u.fecha_registro)', r);        // usuarios por fecha de registro

  // ----- Usuarios -----
  const [[us]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(ro.nombre = 'Estudiante') AS estudiantes,
            SUM(ro.nombre = 'Tutor') AS tutores,
            SUM(ro.nombre = 'Administrador') AS administradores,
            SUM(u.estado = 0) AS desactivados
     FROM usuarios u JOIN roles ro ON ro.id_rol = u.id_rol`);
  const [[nuevos]] = await db.query(`SELECT COUNT(*) AS n FROM usuarios u WHERE 1=1${fU.sql}`, fU.params);

  // ----- Tutorías -----
  const [[tu]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(t.estado = 'Activa') AS activas,
            SUM(t.estado = 'Cerrada') AS cerradas,
            SUM(t.estado = 'Cancelada') AS canceladas,
            SUM(t.estado <> 'Cancelada' AND t.fecha < CURDATE()) AS realizadas,
            SUM(t.estado = 'Activa' AND t.fecha >= CURDATE()) AS proximas,
            SUM(t.modalidad = 'Presencial') AS presenciales,
            SUM(t.modalidad = 'Virtual') AS virtuales,
            SUM(t.estado <> 'Cancelada') AS cupos_tutorias,
            COALESCE(SUM(CASE WHEN t.estado <> 'Cancelada' THEN t.cupo END), 0) AS cupos_total
     FROM tutorias t WHERE 1=1${fT.sql}`, fT.params);
  const [[ocup]] = await db.query(
    `SELECT COUNT(*) AS n FROM solicitudes s JOIN tutorias t ON t.id_tutoria = s.id_tutoria
     WHERE s.estado = 'Aceptada' AND t.estado <> 'Cancelada'${fT.sql}`, fT.params);
  const [[sinSol]] = await db.query(
    `SELECT COUNT(*) AS n FROM tutorias t
     WHERE t.estado <> 'Cancelada' AND NOT EXISTS (SELECT 1 FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria)${fT.sql}`, fT.params);

  // ----- Solicitudes -----
  const [[so]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(s.estado = 'Pendiente') AS pendientes,
            SUM(s.estado = 'Aceptada') AS aceptadas,
            SUM(s.estado = 'Rechazada') AS rechazadas,
            SUM(s.estado = 'Cancelada') AS canceladas,
            COUNT(DISTINCT s.id_estudiante) AS estudiantes_activos
     FROM solicitudes s WHERE 1=1${fS.sql}`, fS.params);

  const n = (v) => Number(v || 0);
  const resumen = {
    usuarios: { total: n(us.total), estudiantes: n(us.estudiantes), tutores: n(us.tutores), administradores: n(us.administradores), desactivados: n(us.desactivados), nuevos: n(nuevos.n) },
    tutorias: {
      total: n(tu.total), activas: n(tu.activas), cerradas: n(tu.cerradas), canceladas: n(tu.canceladas),
      realizadas: n(tu.realizadas), proximas: n(tu.proximas), presenciales: n(tu.presenciales), virtuales: n(tu.virtuales),
      cupos: n(tu.cupos_total), cuposOcupados: n(ocup.n), ocupacion: porcentaje(n(ocup.n), n(tu.cupos_total)), sinSolicitudes: n(sinSol.n)
    },
    solicitudes: {
      total: n(so.total), pendientes: n(so.pendientes), aceptadas: n(so.aceptadas), rechazadas: n(so.rechazadas), canceladas: n(so.canceladas),
      estudiantesActivos: n(so.estudiantes_activos),
      tasaAceptacion: porcentaje(n(so.aceptadas), n(so.aceptadas) + n(so.rechazadas)),
      promedioPorTutoria: n(tu.total) ? Math.round((n(so.total) / n(tu.total)) * 10) / 10 : 0
    }
  };

  // ----- Por materia -----
  const [porMateria] = await db.query(
    `SELECT m.nombre,
            COUNT(DISTINCT t.id_tutoria) AS tutorias,
            COUNT(s.id_solicitud) AS solicitudes,
            COALESCE(SUM(s.estado = 'Aceptada'), 0) AS aceptadas,
            (SELECT COUNT(*) FROM tutor_materia tm WHERE tm.id_materia = m.id_materia) AS tutores
     FROM materias m
     LEFT JOIN tutorias t ON t.id_materia = m.id_materia${fT.sql}
     LEFT JOIN solicitudes s ON s.id_tutoria = t.id_tutoria
     GROUP BY m.id_materia, m.nombre
     ORDER BY solicitudes DESC, tutorias DESC, m.nombre`, fT.params);

  // ----- Tutores -----
  const [porTutor] = await db.query(
    `SELECT CONCAT(u.nombre, ' ', u.apellido) AS nombre,
            COUNT(DISTINCT t.id_tutoria) AS tutorias,
            COUNT(s.id_solicitud) AS solicitudes,
            COALESCE(SUM(s.estado = 'Aceptada'), 0) AS aceptadas,
            COALESCE(SUM(s.estado = 'Rechazada'), 0) AS rechazadas,
            COUNT(DISTINCT CASE WHEN s.estado = 'Aceptada' THEN s.id_estudiante END) AS estudiantes
     FROM tutores tu
     JOIN usuarios u ON u.id_usuario = tu.id_usuario
     LEFT JOIN tutorias t ON t.id_tutor = tu.id_tutor${fT.sql}
     LEFT JOIN solicitudes s ON s.id_tutoria = t.id_tutoria
     GROUP BY tu.id_tutor, u.nombre, u.apellido
     ORDER BY aceptadas DESC, tutorias DESC, nombre LIMIT 10`, fT.params);

  // ----- Estudiantes -----
  const [porEstudiante] = await db.query(
    `SELECT CONCAT(u.nombre, ' ', u.apellido) AS nombre, e.grado,
            COUNT(s.id_solicitud) AS solicitudes,
            SUM(s.estado = 'Aceptada') AS aceptadas
     FROM solicitudes s
     JOIN estudiantes e ON e.id_estudiante = s.id_estudiante
     JOIN usuarios u ON u.id_usuario = e.id_usuario
     WHERE 1=1${fS.sql}
     GROUP BY e.id_estudiante, u.nombre, u.apellido, e.grado
     ORDER BY solicitudes DESC, nombre LIMIT 10`, fS.params);

  const [porGrado] = await db.query(
    `SELECT COALESCE(NULLIF(e.grado, ''), 'Sin grado') AS nombre, COUNT(*) AS solicitudes
     FROM solicitudes s JOIN estudiantes e ON e.id_estudiante = s.id_estudiante
     WHERE 1=1${fS.sql} GROUP BY nombre ORDER BY solicitudes DESC`, fS.params);

  // ----- Cuándo se dan las tutorías -----
  const [porDia] = await db.query(
    `SELECT DAYOFWEEK(t.fecha) AS dia, COUNT(*) AS tutorias
     FROM tutorias t WHERE t.estado <> 'Cancelada'${fT.sql} GROUP BY dia`, fT.params);
  const nombresDia = { 2: 'Lunes', 3: 'Martes', 4: 'Miércoles', 5: 'Jueves', 6: 'Viernes', 7: 'Sábado', 1: 'Domingo' };
  const diasOrden = [2, 3, 4, 5, 6, 7, 1].map((d) => ({ nombre: nombresDia[d], tutorias: n((porDia.find((x) => x.dia === d) || {}).tutorias) }));

  const [[franja]] = await db.query(
    `SELECT COALESCE(SUM(t.hora_inicio < '12:00:00'), 0) AS manana, COALESCE(SUM(t.hora_inicio >= '12:00:00'), 0) AS tarde
     FROM tutorias t WHERE t.estado <> 'Cancelada'${fT.sql}`, fT.params);

  // ----- Evolución mensual (últimos 12 meses con datos dentro del rango) -----
  const meses = new Map();
  const mes = (m) => { if (!meses.has(m)) meses.set(m, { mes: m, usuarios: 0, tutorias: 0, solicitudes: 0 }); return meses.get(m); };
  const [mu] = await db.query(`SELECT DATE_FORMAT(u.fecha_registro, '%Y-%m') AS m, COUNT(*) AS c FROM usuarios u WHERE 1=1${fU.sql} GROUP BY m`, fU.params);
  const [mt] = await db.query(`SELECT DATE_FORMAT(t.fecha, '%Y-%m') AS m, COUNT(*) AS c FROM tutorias t WHERE 1=1${fT.sql} GROUP BY m`, fT.params);
  const [ms] = await db.query(`SELECT DATE_FORMAT(s.fecha_solicitud, '%Y-%m') AS m, COUNT(*) AS c FROM solicitudes s WHERE 1=1${fS.sql} GROUP BY m`, fS.params);
  mu.forEach((x) => { mes(x.m).usuarios = n(x.c); });
  mt.forEach((x) => { mes(x.m).tutorias = n(x.c); });
  ms.forEach((x) => { mes(x.m).solicitudes = n(x.c); });
  const porMes = [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes)).slice(-12);

  res.json({ rango: r, resumen, porMateria, porTutor, porEstudiante, porGrado, porDia: diasOrden, franja: { manana: n(franja.manana), tarde: n(franja.tarde) }, porMes });
}));

// ---------- Exportar a CSV (se abre en Excel) ----------
function csv(columnas, filas) {
  const celda = (v) => {
    let t = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // evita fórmulas al abrir en Excel
    return /[",\n\r;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return '﻿' + [columnas.map((c) => c[0]).join(','), ...filas.map((f) => columnas.map((c) => celda(f[c[1]])).join(','))].join('\r\n');
}

router.get('/exportar/:tipo', ah(async (req, res) => {
  const r = rango(req);
  let columnas, filas;
  if (req.params.tipo === 'tutorias') {
    const f = filtro('t.fecha', r);
    columnas = [['ID', 'id'], ['Título', 'titulo'], ['Materia', 'materia'], ['Tutor', 'tutor'], ['Modalidad', 'modalidad'], ['Fecha', 'fecha'], ['Inicio', 'hora_inicio'], ['Fin', 'hora_fin'], ['Estado', 'estado'], ['Cupo', 'cupo'], ['Aceptadas', 'aceptadas'], ['Pendientes', 'pendientes']];
    [filas] = await db.query(
      `SELECT t.id_tutoria AS id, t.titulo, m.nombre AS materia, CONCAT(u.nombre, ' ', u.apellido) AS tutor, t.modalidad, t.fecha, t.hora_inicio, t.hora_fin, t.estado, t.cupo,
              (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Aceptada') AS aceptadas,
              (SELECT COUNT(*) FROM solicitudes s WHERE s.id_tutoria = t.id_tutoria AND s.estado = 'Pendiente') AS pendientes
       FROM tutorias t JOIN materias m ON m.id_materia = t.id_materia JOIN tutores tu ON tu.id_tutor = t.id_tutor JOIN usuarios u ON u.id_usuario = tu.id_usuario
       WHERE 1=1${f.sql} ORDER BY t.fecha, t.hora_inicio`, f.params);
  } else if (req.params.tipo === 'solicitudes') {
    const f = filtro('DATE(s.fecha_solicitud)', r);
    columnas = [['ID', 'id'], ['Fecha de solicitud', 'fecha_solicitud'], ['Estudiante', 'estudiante'], ['Grado', 'grado'], ['Tutoría', 'titulo'], ['Materia', 'materia'], ['Tutor', 'tutor'], ['Fecha de la tutoría', 'fecha'], ['Estado', 'estado']];
    [filas] = await db.query(
      `SELECT s.id_solicitud AS id, s.fecha_solicitud, CONCAT(ue.nombre, ' ', ue.apellido) AS estudiante, e.grado, t.titulo, m.nombre AS materia,
              CONCAT(ut.nombre, ' ', ut.apellido) AS tutor, t.fecha, s.estado
       FROM solicitudes s
       JOIN estudiantes e ON e.id_estudiante = s.id_estudiante JOIN usuarios ue ON ue.id_usuario = e.id_usuario
       JOIN tutorias t ON t.id_tutoria = s.id_tutoria JOIN materias m ON m.id_materia = t.id_materia
       JOIN tutores tu ON tu.id_tutor = t.id_tutor JOIN usuarios ut ON ut.id_usuario = tu.id_usuario
       WHERE 1=1${f.sql} ORDER BY s.fecha_solicitud`, f.params);
  } else if (req.params.tipo === 'usuarios') {
    const f = filtro('DATE(u.fecha_registro)', r);
    columnas = [['ID', 'id'], ['Nombre', 'nombre'], ['Apellido', 'apellido'], ['Correo', 'correo'], ['Tipo', 'rol'], ['Estado', 'estado'], ['Registro', 'fecha_registro']];
    [filas] = await db.query(
      `SELECT u.id_usuario AS id, u.nombre, u.apellido, u.correo, ro.nombre AS rol, IF(u.estado = 1, 'Activo', 'Desactivado') AS estado, u.fecha_registro
       FROM usuarios u JOIN roles ro ON ro.id_rol = u.id_rol WHERE 1=1${f.sql} ORDER BY u.fecha_registro`, f.params);
  } else {
    throw new ApiError(404, 'Ese reporte no existe.');
  }
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="edututor-${req.params.tipo}.csv"`);
  res.send(csv(columnas, filas));
}));

module.exports = router;
