// Utilidades de interfaz compartidas por todas las páginas.

const MENU = {
  Estudiante: [
    ['Buscar tutorías', '/estudiante/buscar.html'],
    ['Mis solicitudes', '/estudiante/mis-solicitudes.html'],
    ['Perfil', '/perfil.html']
  ],
  Tutor: [
    ['Mis tutorías', '/tutor/mis-tutorias.html'],
    ['Disponibilidad', '/tutor/disponibilidad.html'],
    ['Solicitudes', '/tutor/solicitudes.html'],
    ['Perfil', '/perfil.html']
  ],
  Administrador: [
    ['Usuarios', '/admin/usuarios.html'],
    ['Materias', '/admin/materias.html'],
    ['Estadísticas', '/admin/estadisticas.html'],
    ['Perfil', '/perfil.html']
  ]
};

const INICIO = {
  Estudiante: '/estudiante/buscar.html',
  Tutor: '/tutor/mis-tutorias.html',
  Administrador: '/admin/usuarios.html'
};

// Escapa texto para insertarlo de forma segura en HTML.
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtFecha(f) {
  if (!f) return '';
  const [a, m, d] = String(f).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

function fmtHora(h) { return h ? String(h).slice(0, 5) : ''; }

function fmtFechaHora(f) {
  return f ? `${fmtFecha(f)} ${fmtHora(String(f).slice(11))}` : '';
}

function badge(estado) { return `<span class="badge b-${esc(estado)}">${esc(estado)}</span>`; }

let temporizadorToast;
function mensaje(texto, tipo = 'ok') {
  const t = document.getElementById('toast');
  if (!t) return alert(texto);
  t.textContent = texto;
  t.className = `toast visible ${tipo}`;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => t.classList.remove('visible'), 3800);
}

function mostrarError(e) { mensaje(e.message || 'Ocurrió un error.', 'error'); }

function construirNav(usuario) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const actual = location.pathname;
  const enlaces = MENU[usuario.rol].map(([texto, url]) =>
    `<a href="${url}" class="${actual === url ? 'activo' : ''}">${texto}</a>`).join('');
  nav.innerHTML = `${enlaces}<span class="usuario">${esc(usuario.nombre)} (${esc(usuario.rol)})</span><button id="btnSalir" type="button">Cerrar sesión</button>`;

  document.getElementById('btnSalir').addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method: 'POST', sinRedirigir: true }); } catch (e) { /* se ignora */ }
    location.href = '/index.html';
  });
  const btn = document.getElementById('menuBtn');
  if (btn) btn.addEventListener('click', () => nav.classList.toggle('abierto'));
}

// Verifica la sesión y el rol; si no corresponde, redirige. Devuelve el usuario.
async function iniciarPagina(rolesPermitidos) {
  let usuario;
  try {
    usuario = (await api('/api/auth/me')).usuario;
  } catch (e) {
    return null;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    location.href = INICIO[usuario.rol];
    return null;
  }
  construirNav(usuario);
  return usuario;
}
