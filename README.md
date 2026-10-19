# EduTutor

Plataforma web de tutorías académicas. Interfaz en HTML, CSS y JavaScript; servidor en Node.js + Express; base de datos MySQL (administrada con MySQL Workbench).

> Para publicarla en Internet gratis, lee **PUBLICAR.md**.

## Requisitos

- Node.js 18 o superior (https://nodejs.org, versión LTS)
- MySQL Server 8 y MySQL Workbench
- Un navegador moderno (Chrome, Edge o Firefox)

## Cómo ponerlo a funcionar en tu computadora

1. **Descomprime** la carpeta `edututor`.

2. **Crea la base de datos.** Abre MySQL Workbench, conéctate a tu servidor local, ve a
   `File > Open SQL Script`, elige `database/edututor.sql` y presiona el botón del rayo (Execute).
   Se crea la base `edututor` con sus 9 tablas.

3. **Escribe tu contraseña de MySQL.** Abre una terminal dentro de la carpeta `edututor` y ejecuta:

   ```
   copy .env.example .env
   notepad .env
   ```

   (en Mac/Linux: `cp .env.example .env`). En el Bloc de notas cambia
   `escribe_aqui_tu_contrasena_de_mysql` por tu contraseña de MySQL y guarda.
   El usuario por defecto es `root`; cámbialo en `DB_USER` si usas otro.

4. **Instala las dependencias:**

   ```
   npm install
   ```

5. **Inicia el servidor:**

   ```
   npm start
   ```

   Debe aparecer: `EduTutor funcionando en http://localhost:3000`.
   La primera vez también se crean la cuenta de administrador y 8 materias de ejemplo.

6. **Abre el navegador** en http://localhost:3000

## Cuenta de administrador (solo en tu computadora)

| Correo | Contraseña |
| --- | --- |
| admin@edututor.com | Admin123 |

Cámbiala desde "Perfil". En Internet esta cuenta no existe: se crea con las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` (ver PUBLICAR.md).
Los estudiantes y tutores se registran solos desde "Regístrate aquí".

## Flujo de prueba sugerido

1. Regístrate como **Tutor** y entra a "Perfil": marca las materias que impartes y guarda.
2. En "Mis tutorías" crea una tutoría (fecha futura). En "Disponibilidad" agrega tus horarios.
3. Cierra sesión y regístrate como **Estudiante**. En "Buscar tutorías" filtra, presiona "Ver" y "Solicitar".
4. Vuelve a entrar como tutor: en "Solicitudes" acepta o rechaza.
5. Entra como administrador para gestionar usuarios, materias y ver estadísticas.

## Estructura

```
edututor/
├── database/edututor.sql     Script de la base de datos
├── server/                   Servidor Express
│   ├── app.js                Punto de entrada
│   ├── config/db.js          Conexión a MySQL (lee el archivo .env)
│   ├── middlewares/auth.js   Control de sesión y roles
│   ├── routes/               API: auth, perfil, usuarios, materias,
│   │                         disponibilidades, tutorias, solicitudes, estadisticas
│   └── utils/                Validaciones, errores, límite de intentos y datos iniciales
├── public/                   Páginas que ve el usuario
│   ├── index.html, registro.html, perfil.html
│   ├── estudiante/  tutor/  admin/
│   └── css/  js/
├── .env.example              Plantilla de configuración (copiar como .env)
├── PUBLICAR.md               Guía para publicar en Internet
└── README.md
```

## Problemas comunes

| Problema | Causa probable | Solución |
| --- | --- | --- |
| "No se pudo conectar con la base de datos" | MySQL apagado, contraseña incorrecta o no se ejecutó el script SQL | Revisa los 3 puntos; prueba la misma conexión en Workbench |
| `Access denied for user 'root'` | Contraseña incorrecta en `.env` | Corrígela en el archivo `.env` y vuelve a iniciar |
| `Unknown database 'edututor'` | No se ejecutó el script SQL | Hazlo en MySQL Workbench (paso 2) |
| `Client does not support authentication protocol` | Cuenta con autenticación antigua | En Workbench: `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';` |
| `EADDRINUSE` / puerto 3000 en uso | Otra aplicación usa el puerto | Cambia `PORT=3001` en el archivo `.env` |
| `npm` no se reconoce | Node.js no está instalado | Instala Node.js y abre una terminal nueva |
| La página se ve sin estilos o no carga | Abriste `index.html` con doble clic | Debes entrar por http://localhost:3000 con el servidor encendido |
| `Demasiados intentos fallidos` | 8 contraseñas incorrectas seguidas | Espera 15 minutos o reinicia el servidor |
