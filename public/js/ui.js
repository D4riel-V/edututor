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
    ['Tutorías', '/admin/tutorias.html'],
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

// Agrega un botón "Ver / Ocultar" a todos los campos de contraseña de la página.
function activarVerContrasena() {
  document.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.dataset.ojo) return;
    input.dataset.ojo = '1';
    const caja = document.createElement('div');
    caja.className = 'pw-caja';
    input.parentNode.insertBefore(caja, input);
    caja.appendChild(input);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pw-ver';
    b.textContent = 'Ver';
    b.setAttribute('aria-label', 'Mostrar contraseña');
    b.addEventListener('click', () => {
      const oculto = input.type === 'password';
      input.type = oculto ? 'text' : 'password';
      b.textContent = oculto ? 'Ocultar' : 'Ver';
      b.setAttribute('aria-label', oculto ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
    caja.appendChild(b);
  });
}
document.addEventListener('DOMContentLoaded', activarVerContrasena);

// Los números de las tarjetas de estadísticas suben desde 0 al aparecer.
function animarNumero(el) {
  const texto = el.textContent.trim();
  const m = texto.match(/^(\d+(?:\.\d+)?)(%?)$/);
  if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const meta = parseFloat(m[1]);
  const decimales = (m[1].split('.')[1] || '').length;
  const inicio = performance.now();
  const duracion = 800;
  (function paso(t) {
    const p = Math.min(1, (t - inicio) / duracion);
    const v = meta * (1 - Math.pow(1 - p, 3));
    el.textContent = v.toFixed(decimales) + m[2];
    if (p < 1) requestAnimationFrame(paso); else el.textContent = texto;
  })(inicio);
}
new MutationObserver((cambios) => {
  cambios.forEach((c) => c.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    const lista = n.matches && n.matches('.stat .num') ? [n] : n.querySelectorAll ? n.querySelectorAll('.stat .num') : [];
    lista.forEach(animarNumero);
  }));
}).observe(document.documentElement, { childList: true, subtree: true });

// Los números de las tarjetas "suben" desde 0 hasta su valor (se omite si el sistema pide menos movimiento).
function animarNumeros(raiz = document) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  raiz.querySelectorAll('.stat .num').forEach((el) => {
    const texto = el.textContent.trim();
    const m = texto.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const fin = parseFloat(m[1]);
    const dec = (m[1].split('.')[1] || '').length;
    const inicio = performance.now();
    const paso = (ahora) => {
      const p = Math.min(1, (ahora - inicio) / 700);
      el.textContent = (fin * (1 - Math.pow(1 - p, 3))).toFixed(dec) + m[2];
      if (p < 1) requestAnimationFrame(paso); else el.textContent = texto;
    };
    requestAnimationFrame(paso);
  });
}
