# Citas médicas · API

Backend académico para administrar pacientes, doctores y citas. Es la API del [frontend de citas médicas](https://github.com/darc182/sistema-citas-medicas). Utiliza Node.js, Express y Supabase; el código y el esquema de datos están en este repositorio.

## Funciones presentes en el código

- Rutas de autenticación y middleware para proteger operaciones.
- Consulta y gestión de pacientes, doctores y citas.
- Al crear una cita, comprobación de conflictos para el doctor y el paciente en la fecha y hora elegidas.
- Filtros y paginación de citas, manejo de errores y endpoint `GET /api/health`.

## Tecnologías

Node.js · Express · Supabase/PostgreSQL · JWT · Joi · Helmet · Morgan.

## Puesta en marcha

1. Instala Node.js 18 o superior y ejecuta `npm install`.
2. Copia `.env.example` a `.env` y completa las variables para Supabase, JWT y CORS con valores de tu propio entorno.
3. Prepara la base de datos con `database/schema.sql`. El archivo `database/seed.sql` contiene datos de ejemplo.
4. Ejecuta `npm run dev` para desarrollo o `npm start` para iniciar el servidor.

```bash
npm install
cp .env.example .env
npm run dev
```

El puerto predeterminado es `5000`. Puedes consultar `GET http://localhost:5000/api/health` para comprobar que el servidor responde. Las operaciones están agrupadas bajo `/api/auth`, `/api/pacientes`, `/api/doctores` y `/api/citas`.

## Estructura

- `routes/`: operaciones de la API.
- `middleware/`: autenticación y manejo de errores.
- `config/`: conexión a Supabase.
- `database/`: esquema y datos de ejemplo.
- `server.js`: configuración del servidor y rutas.

## Estado del proyecto

Es un proyecto académico que requiere configurar un proyecto propio de Supabase para probar el flujo completo. El comando `npm test` todavía no contiene una suite de pruebas implementada; por eso la documentación no lo presenta como una verificación aprobada. No incluyas claves reales en el repositorio.
