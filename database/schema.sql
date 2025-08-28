-- Esquema de base de datos para Sistema de Citas Médicas
-- Base de datos: PostgreSQL (Supabase)

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro')),
    direccion TEXT,
    tipo_sangre VARCHAR(5),
    alergias TEXT,
    enfermedades_cronicas TEXT,
    contacto_emergencia_nombre VARCHAR(200),
    contacto_emergencia_telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de doctores
CREATE TABLE IF NOT EXISTS doctores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100) NOT NULL,
    numero_licencia VARCHAR(50) UNIQUE NOT NULL,
    universidad VARCHAR(200),
    experiencia_anos INTEGER DEFAULT 0,
    consulta_precio DECIMAL(10,2),
    horario_atencion JSONB, -- {"lunes": {"inicio": "08:00", "fin": "17:00"}, ...}
    dias_disponibles TEXT[], -- ["lunes", "martes", "miercoles", ...]
    disponible BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctores(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo_consulta TEXT NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    medicamentos_recetados TEXT,
    observaciones TEXT,
    tipo_cita VARCHAR(50) DEFAULT 'consulta' CHECK (tipo_cita IN ('consulta', 'control', 'procedimiento', 'cirugia')),
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
    precio DECIMAL(10,2),
    notas TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar citas duplicadas del mismo doctor en la misma fecha/hora
    CONSTRAINT unique_doctor_datetime UNIQUE (doctor_id, fecha, hora)
);

-- Tabla de historial médico
CREATE TABLE IF NOT EXISTS historial_medico (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES doctores(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnostico TEXT,
    tratamiento TEXT,
    medicamentos TEXT,
    examenes_solicitados TEXT,
    proxima_cita DATE,
    observaciones TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_activo ON pacientes(activo);

CREATE INDEX IF NOT EXISTS idx_doctores_cedula ON doctores(cedula);
CREATE INDEX IF NOT EXISTS idx_doctores_email ON doctores(email);
CREATE INDEX IF NOT EXISTS idx_doctores_especialidad ON doctores(especialidad);
CREATE INDEX IF NOT EXISTS idx_doctores_disponible ON doctores(disponible);
CREATE INDEX IF NOT EXISTS idx_doctores_activo ON doctores(activo);

CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_doctor ON citas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_doctor ON citas(fecha, doctor_id);

CREATE INDEX IF NOT EXISTS idx_historial_paciente ON historial_medico(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historial_doctor ON historial_medico(doctor_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_medico(fecha);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_doctores_updated_at BEFORE UPDATE ON doctores
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_historial_updated_at BEFORE UPDATE ON historial_medico
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) - Configuración básica
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctores ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_medico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (pueden ser ajustadas según necesidades)
CREATE POLICY "Usuarios autenticados pueden ver pacientes" ON pacientes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar pacientes" ON pacientes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar pacientes" ON pacientes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver doctores" ON doctores
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar doctores" ON doctores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar doctores" ON doctores
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver citas" ON citas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar citas" ON citas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar citas" ON citas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver historial" ON historial_medico
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar historial" ON historial_medico
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar historial" ON historial_medico
    FOR UPDATE USING (auth.role() = 'authenticated');
