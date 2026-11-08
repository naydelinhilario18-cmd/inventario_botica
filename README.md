# Nova Salud

Sistema web inicial para administrar productos, existencias, clientes y ventas de
la botica Nova Salud. La aplicación usa React y Vite, una API Node.js/Express y
MySQL.

## Iniciar con Docker

1. Copia `.env.example` como `.env` y cambia las contraseñas para tu entorno.
2. Desde esta carpeta ejecuta:

   ```sh
   docker compose up --build
   ```

3. Abre <http://localhost:5173>.

La API está disponible en <http://localhost:3000/api/health> y MySQL en el
puerto local `3307` (el contenedor usa el puerto `3306`). Los puertos se pueden
cambiar en `.env` con `FRONTEND_PORT`, `API_PORT` y `MYSQL_PORT`; al cambiar el
puerto de la API, actualiza también `VITE_API_URL`. Para detener los servicios
usa `docker compose down`. La base de datos queda guardada en el volumen
`mysql_data`.

Si ya existía un volumen de una versión anterior, el backend crea las tablas que
faltan al iniciar sin borrar los datos existentes.

## Acceso inicial

El primer inicio crea el usuario administrador:

- Correo: `admin@novasalud.local`
- Contraseña: el valor de `ADMIN_PASSWORD` en `.env`; por defecto,
  `NovaSalud123!` solo para desarrollo local.

Cambia la contraseña antes de usarlo fuera de un entorno local. El sistema
también permite crear cuentas de personal desde la sección **Usuarios**.

## Funcionalidades

- Panel con resumen de productos, clientes, ventas del día y alertas.
- Registro, edición, búsqueda y consulta de productos y existencias.
- Alertas por stock bajo y productos próximos a vencer (30 días).
- Registro de clientes.
- Registro de ventas con varias líneas, cálculo de totales y descuento de stock
  dentro de una transacción.
- Historial de ventas y reportes por periodo de 7, 30 o 90 días.
- Autenticación con contraseña hasheada, JWT, permisos de administrador,
  consultas SQL parametrizadas, limitación de intentos de inicio de sesión y
  cabeceras HTTP seguras.

Esta versión es una base académica funcional. Antes de desplegarla en Internet
se deben configurar secretos fuertes, HTTPS, copias de seguridad y las políticas
de privacidad y seguridad aplicables a los datos de clientes.
