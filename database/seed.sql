-- Datos de prueba para el sistema de citas médicas
-- Ejecutar después de crear el schema

-- Insertar doctores de prueba
INSERT INTO doctores (cedula, nombre, apellido, email, telefono, especialidad, numero_licencia, universidad, experiencia_anos, consulta_precio, horario_atencion, dias_disponibles, disponible) VALUES
('12345678', 'Juan Carlos', 'Rodríguez Pérez', 'juan.rodriguez@hospital.com', '+57 300 123 4567', 'Cardiología', 'LIC-001-2018', 'Universidad Nacional', 8, 120000, '{"lunes": {"inicio": "08:00", "fin": "17:00"}, "martes": {"inicio": "08:00", "fin": "17:00"}, "miercoles": {"inicio": "08:00", "fin": "17:00"}, "jueves": {"inicio": "08:00", "fin": "17:00"}, "viernes": {"inicio": "08:00", "fin": "15:00"}}', ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], true),

('23456789', 'María Elena', 'García Martínez', 'maria.garcia@hospital.com', '+57 300 234 5678', 'Pediatría', 'LIC-002-2019', 'Universidad Javeriana', 6, 100000, '{"lunes": {"inicio": "07:00", "fin": "16:00"}, "martes": {"inicio": "07:00", "fin": "16:00"}, "miercoles": {"inicio": "07:00", "fin": "16:00"}, "jueves": {"inicio": "07:00", "fin": "16:00"}, "viernes": {"inicio": "07:00", "fin": "14:00"}}', ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], true),

('34567890', 'Carlos Alberto', 'López Hernández', 'carlos.lopez@hospital.com', '+57 300 345 6789', 'Medicina General', 'LIC-003-2020', 'Universidad de los Andes', 4, 80000, '{"lunes": {"inicio": "06:00", "fin": "18:00"}, "martes": {"inicio": "06:00", "fin": "18:00"}, "miercoles": {"inicio": "06:00", "fin": "18:00"}, "jueves": {"inicio": "06:00", "fin": "18:00"}, "viernes": {"inicio": "06:00", "fin": "18:00"}, "sabado": {"inicio": "08:00", "fin": "14:00"}}', ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'], true),

('45678901', 'Ana Patricia', 'Morales Vega', 'ana.morales@hospital.com', '+57 300 456 7890', 'Ginecología', 'LIC-004-2017', 'Universidad del Rosario', 10, 130000, '{"lunes": {"inicio": "08:00", "fin": "17:00"}, "martes": {"inicio": "08:00", "fin": "17:00"}, "miercoles": {"inicio": "08:00", "fin": "17:00"}, "jueves": {"inicio": "08:00", "fin": "17:00"}, "viernes": {"inicio": "08:00", "fin": "15:00"}}', ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], true),

('56789012', 'Roberto', 'Jiménez Castro', 'roberto.jimenez@hospital.com', '+57 300 567 8901', 'Dermatología', 'LIC-005-2021', 'Universidad El Bosque', 3, 110000, '{"lunes": {"inicio": "09:00", "fin": "18:00"}, "martes": {"inicio": "09:00", "fin": "18:00"}, "miercoles": {"inicio": "09:00", "fin": "18:00"}, "jueves": {"inicio": "09:00", "fin": "18:00"}, "viernes": {"inicio": "09:00", "fin": "16:00"}}', ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], true);

-- Insertar pacientes de prueba
INSERT INTO pacientes (cedula, nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion, tipo_sangre, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono) VALUES
('98765432', 'María José', 'González Silva', 'maria.gonzalez@email.com', '+57 310 123 4567', '1985-03-15', 'femenino', 'Calle 123 #45-67, Bogotá', 'O+', 'Penicilina', 'Pedro González', '+57 310 987 6543'),

('87654321', 'Luis Fernando', 'Martínez Torres', 'luis.martinez@email.com', '+57 320 234 5678', '1990-07-22', 'masculino', 'Carrera 456 #78-90, Medellín', 'A+', 'Ninguna conocida', 'Carmen Torres', '+57 320 876 5432'),

('76543210', 'Sandra', 'Ramírez Ortega', 'sandra.ramirez@email.com', '+57 315 345 6789', '1978-12-08', 'femenino', 'Avenida 789 #12-34, Cali', 'B-', 'Ibuprofeno, Polen', 'Miguel Ortega', '+57 315 765 4321'),

('65432109', 'Jorge Andrés', 'Herrera Díaz', 'jorge.herrera@email.com', '+57 300 456 7890', '1995-05-30', 'masculino', 'Transversal 321 #56-78, Barranquilla', 'AB+', 'Mariscos', 'Luisa Díaz', '+57 300 654 3210'),

('54321098', 'Carolina', 'Vargas Ruiz', 'carolina.vargas@email.com', '+57 301 567 8901', '1982-09-14', 'femenino', 'Diagonal 654 #32-10, Bucaramanga', 'O-', 'Aspirina', 'Eduardo Ruiz', '+57 301 543 2109'),

('43210987', 'Andrés Felipe', 'Castillo Moreno', 'andres.castillo@email.com', '+57 302 678 9012', '1988-11-25', 'masculino', 'Calle 987 #65-43, Pereira', 'A-', 'Ninguna conocida', 'Patricia Moreno', '+57 302 432 1098'),

('32109876', 'Diana Marcela', 'Ospina Aguilar', 'diana.ospina@email.com', '+57 303 789 0123', '1993-02-18', 'femenino', 'Carrera 111 #22-33, Manizales', 'B+', 'Latex', 'Carlos Aguilar', '+57 303 321 0987');

-- Insertar citas de prueba (usando IDs que se generarían automáticamente)
-- Nota: En la práctica, necesitarías los IDs reales generados por la base de datos

-- Ejemplo de inserción de citas (ajustar con IDs reales):
INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo_consulta, tipo_cita, estado, precio) 
SELECT 
    p.id as paciente_id,
    d.id as doctor_id,
    '2024-12-01' as fecha,
    '10:00' as hora,
    'Control cardiovascular rutinario' as motivo_consulta,
    'control' as tipo_cita,
    'programada' as estado,
    120000 as precio
FROM pacientes p, doctores d 
WHERE p.cedula = '98765432' AND d.cedula = '12345678'
LIMIT 1;

INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo_consulta, tipo_cita, estado, precio)
SELECT 
    p.id as paciente_id,
    d.id as doctor_id,
    '2024-12-02' as fecha,
    '14:30' as hora,
    'Control pediátrico - vacunas' as motivo_consulta,
    'consulta' as tipo_cita,
    'programada' as estado,
    100000 as precio
FROM pacientes p, doctores d 
WHERE p.cedula = '87654321' AND d.cedula = '23456789'
LIMIT 1;

INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo_consulta, tipo_cita, estado, precio)
SELECT 
    p.id as paciente_id,
    d.id as doctor_id,
    '2024-11-28' as fecha,
    '09:15' as hora,
    'Dolor de cabeza recurrente' as motivo_consulta,
    'consulta' as tipo_cita,
    'completada' as estado,
    80000 as precio
FROM pacientes p, doctores d 
WHERE p.cedula = '76543210' AND d.cedula = '34567890'
LIMIT 1;

INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo_consulta, tipo_cita, estado, precio)
SELECT 
    p.id as paciente_id,
    d.id as doctor_id,
    '2024-12-05' as fecha,
    '11:00' as hora,
    'Control ginecológico anual' as motivo_consulta,
    'control' as tipo_cita,
    'programada' as estado,
    130000 as precio
FROM pacientes p, doctores d 
WHERE p.cedula = '54321098' AND d.cedula = '45678901'
LIMIT 1;

INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo_consulta, tipo_cita, estado, precio)
SELECT 
    p.id as paciente_id,
    d.id as doctor_id,
    '2024-11-30' as fecha,
    '16:45' as hora,
    'Revisión lunar sospechoso' as motivo_consulta,
    'consulta' as tipo_cita,
    'programada' as estado,
    110000 as precio
FROM pacientes p, doctores d 
WHERE p.cedula = '65432109' AND d.cedula = '56789012'
LIMIT 1;
