# Cómo publicar en Internet

Se usan tres servicios gratuitos:

Guardar el código: GitHub - github.com 
Base de datos MySQL: Aiven (plan Free) - console.aiven.io 
Servidor de la aplicación: Render (plan Free) - render.com 

se usaran nada mas los planes gratuitos, los cuales están sujetos a constantes cambios.

## Parte 1. Crear la base de datos en Aiven

1. Entra a **console.aiven.io** y crea una cuenta.
2. Presiona **Create service** y elige **MySQL**.
3. En **Service tier** elige el plan gratuito (Free). En el plan gratis no se puede elegir la nube ni la región; omite ese campo. Ponle un nombre a tu base de datos en **Service details** y presiona **Create service**.
4. Espera unos minutos hasta que el estado sea **Running**.
5. En la pantalla del servicio (Overview) copia y guarda en un bloc de notas estos 5 datos:
   - **Host** (algo como `edututor-db-xxxx.aivencloud.com`)
   - **Port** (un número, por ejemplo `12345`)
   - **User** (normalmente `avnadmin`)
   - **Password** (presiona el ojo para verla)
   - **Database name** (normalmente `defaultdb`)

Son los que necesitaremos mas adelante.

Nota: No hace falta crear tablas, estas se crean la primera vez que arranca el sitio.


## Parte 2. Subir el código a GitHub

1. Entra a **github.com** y crea una cuenta.
2. Presiona **New repository**. Nombre: `el nombre de tu sitio`. Puede ser Public o Private. Presiona **Create repository**.
3. En la pantalla que aparece, busca el enlace **uploading an existing file**.
4. Abre la carpeta de tu sitio web en tu computadora y arrastra a la página **solo el contenido**:
5. **No arrastres** carpetas o archivos que contengan contraseñas ni informacion importante.
6. Abajo presiona **Commit changes**.
   

## Parte 3. Publicar el servidor en Render

1. Entra a **render.com** y crea la cuenta con el botón **GitHub** (así se conectan).
2. Presiona **New +** y elige **Web Service**. Selecciona tu repositorio (si no aparece, autoriza a Render a ver tus repositorios).
3. Completa:
   - **Name:** `mi-sitio-web` (será parte de tu dirección web)
   - **Branch:** `main`
   - **Runtime / Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
4. Busca la sección **Environment Variables** y agrega estas, una por una (nombre = valor):

   | Nombre | Valor |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DB_HOST` | el Host de Aiven |
   | `DB_PORT` | el Port de Aiven |
   | `DB_USER` | el User de Aiven |
   | `DB_PASSWORD` | el Password de Aiven |
   | `DB_NAME` | el Database name de Aiven |
   | `DB_SSL` | `true` |
   | `SESSION_SECRET` | una frase larga inventada por ti, sin espacios, de 30 letras o más |
   | `ADMIN_EMAIL` | el correo con el que quieres entrar como administrador |
   | `ADMIN_PASSWORD` | la contraseña del administrador (mínimo 8 caracteres) |

5. Presiona **Create Web Service**. Render instala todo y arranca; tarda unos minutos.
6. Cuando diga **Live**, arriba verás tu dirección, algo como `https://mi-sitio-web-xxxx.onrender.com`. Esa es tu página en Internet.


## Parte 4. Probar

1. Abre tu dirección de Render.
2. Entra con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
3. Prueba registrando informacion desde otro navegador o desde tu celular.

Si no carga, en Render abre la pestaña **Logs**: el servidor escribe ahí el motivo.


## Cosas que debes saber del plan gratuito

- **Render se "duerme"** si nadie visita la página por 15 minutos. La primera visita después tarda cerca de 1 minuto en cargar. Antes de una presentación, ábrela un par de minutos antes.
- **Las sesiones se cierran** cuando Render reinicia el servidor; los usuarios solo vuelven a iniciar sesión. Los datos no se pierden, porque viven en Aiven.
- **Aiven apaga la base** si pasa un tiempo sin uso. Avisa por correo antes. Si la página muestra errores de base de datos, entra a Aiven y enciende el servicio.
- Si cambias el código, súbelo de nuevo a GitHub (Add file > Upload files). Render vuelve a publicar solo.

## Cargar datos de ejemplo en la nube

Con MySQL Workbench crea una conexión nueva con el Host, Port, User y Password de Aiven (en la pestaña SSL elige "Require") y ejecuta ahí tu script de registros.

## Seguridad

- Nunca subas a GitHub un archivo con contraseñas.
- Cambia la contraseña del administrador si alguien más la llega a ver.
- La conexión a la base está cifrada. Por simplicidad no se verifica, mas adelante es indispensable esa verificacion.

## Cómo actualizar la página después de publicarla

1. Cambia los archivos en tu computadora y pruébalos con `npm start`.
2. En GitHub abre tu repositorio y presiona **Add file > Upload files**. Arrastra los archivos cambiados (mismo nombre y misma carpeta) y presiona **Commit changes**.
3. Render detecta el cambio y publica la nueva versión solo (tarda 2 a 5 minutos). Lo puedes ver en la pestaña **Events** o **Logs**.

Los datos de la base (usuarios, tutorías) no se borran al actualizar el código.
