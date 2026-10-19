# EduTutor

Plataforma web de tutorías académicas. Interfaz en HTML, CSS y JavaScript; servidor en Node.js + Express; base de datos MySQL administrada con MySQL Workbench.


## Requisitos

- Node.js 18 o superior (https://nodejs.org, versión LTS)
- MySQL Server 8 y MySQL Workbench
- Un navegador moderno (Chrome, Edge o Firefox)

## Cómo ponerlo a funcionar en tu computadora

1. **Descarga** la carpeta `edututor`.

2. **Crea la base de datos.** Abre MySQL Workbench, conéctate a tu servidor local, ve a
   `File > Open SQL Script`, elige `database/edututor.sql` y presiona el botón del rayo (Execute).
   Se crea la base `edututor` con sus 9 tablas.

3. **Escribe tu contraseña de MySQL.** Abre una terminal dentro de la carpeta `edututor` y ejecuta:

   ```
   copy .env.example .env
   notepad .env
   ```

   (en Mac/Linux: `cp .env.example .env`).

4. En el Bloc de notas cambia `escribe_aqui_tu_contrasena_de_mysql` por tu contraseña de MySQL y guarda.
   El usuario por defecto es `root`; cámbialo en `DB_USER` si usas otro.

5. **Instala las dependencias:**

   ```
   npm install
   ```

6. **Inicia el servidor:**

   ```
   npm start
   ```

   Debe aparecer: `EduTutor funcionando en http://localhost:3000`.
   La primera vez también se crean la cuenta de administrador y 8 materias de ejemplo.

7. **Abre el navegador** en http://localhost:3000

## Cuenta de administrador (solo en tu computadora)

Correo: admin@edututor.com
Contraseña: Admin123

Cámbiala desde "Perfil".

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
│   ├── config/db.js          Conexión a MySQL 
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
└── README.md                 Guía para publicar en local.
```
