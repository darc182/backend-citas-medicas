# 🏥 Sistema de Citas Médicas - Backend

Backend desarrollado con Node.js, Express y Supabase para el sistema de gestión de citas médicas.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Supabase** - Base de datos PostgreSQL y autenticación
- **JWT** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **Joi** - Validación de datos
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging HTTP

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── supabase.js          # Configuración de Supabase
├── database/
│   ├── schema.sql           # Esquema de la base de datos
│   └── seed.sql             # Datos de prueba
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   └── errorHandler.js      # Manejo global de errores
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── pacientes.js         # Rutas de pacientes
│   ├── doctores.js          # Rutas de doctores
│   └── citas.js             # Rutas de citas
├── .env.example             # Variables de entorno de ejemplo
├── .gitignore
├── package.json
└── server.js                # Punto de entrada de la aplicación
```

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro

# CORS Origin
CORS_ORIGIN=http://localhost:5173
```

### 3. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script `database/schema.sql` en el SQL Editor
3. Ejecutar el script `database/seed.sql` para datos de prueba
4. Obtener las credenciales del proyecto

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor iniciará en `http://localhost:5000`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `GET /api/pacientes/:id` - Obtener paciente
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente
- `GET /api/pacientes/:id/citas` - Historial de citas

### Doctores
- `GET /api/doctores` - Listar doctores
- `GET /api/doctores/:id` - Obtener doctor
- `POST /api/doctores` - Crear doctor
- `PUT /api/doctores/:id` - Actualizar doctor
- `DELETE /api/doctores/:id` - Eliminar doctor
- `GET /api/doctores/:id/citas` - Agenda del doctor
- `GET /api/doctores/meta/especialidades` - Especialidades

### Citas
- `GET /api/citas` - Listar citas
- `GET /api/citas/:id` - Obtener cita
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Eliminar/cancelar cita
- `GET /api/citas/disponibilidad/:doctor_id` - Horarios disponibles
- `GET /api/citas/meta/estadisticas` - Estadísticas

### Salud
- `GET /api/health` - Estado del servidor

## 🔐 Autenticación

El sistema utiliza JWT tokens para autenticación. Incluir el token en el header:

```
Authorization: Bearer <token>
```

## 🗄️ Base de Datos

### Tablas principales:

- **pacientes** - Información de pacientes
- **doctores** - Información de doctores
- **citas** - Citas médicas
- **historial_medico** - Historial médico detallado

### Características:

- Triggers automáticos para `updated_at`
- Row Level Security (RLS) habilitado
- Índices optimizados para consultas frecuentes
- Constraints de integridad referencial

## 🛡️ Seguridad

- **Helmet.js** - Headers de seguridad HTTP
- **CORS** - Configuración de orígenes permitidos
- **JWT** - Tokens de autenticación seguros
- **RLS** - Row Level Security en Supabase
- **Validación** - Joi para validación de entrada

## 📝 Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NODE_ENV` | Entorno de ejecución | Sí |
| `PORT` | Puerto del servidor | No (default: 5000) |
| `SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_KEY` | Clave de servicio (opcional) | No |
| `JWT_SECRET` | Secreto para JWT | Sí |
| `CORS_ORIGIN` | Origen permitido para CORS | Sí |

## 🚀 Despliegue

### Opciones recomendadas:

- **Railway** - Fácil despliegue desde GitHub
- **Heroku** - Plataforma tradicional
- **Vercel** - Para aplicaciones serverless
- **DigitalOcean App Platform** - Contenedores

### Variables de entorno en producción:

Asegurar que todas las variables estén configuradas en el entorno de despliegue.

## 🧪 Datos de Prueba

El archivo `seed.sql` incluye:

- 5 doctores de diferentes especialidades
- 7 pacientes con información completa
- 5 citas de ejemplo

### Credenciales de prueba:

Crear usuarios de prueba manualmente en Supabase Auth o usar la API de registro.

## 📞 Soporte

Para problemas técnicos o preguntas sobre la implementación, revisar:

1. Logs del servidor
2. Documentación de Supabase
3. Consola de desarrollador del navegador
4. Variables de entorno configuradas correctamente

## 🔄 Próximas mejoras

- [ ] Notificaciones por email/SMS
- [ ] Sistema de recordatorios
- [ ] Integración con calendario
- [ ] Reportes avanzados
- [ ] API de pagos
- [ ] Chat en tiempo real
