-- Agregar políticas DELETE faltantes para RLS

-- Políticas DELETE para pacientes
CREATE POLICY "Usuarios autenticados pueden eliminar pacientes" ON pacientes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas DELETE para doctores  
CREATE POLICY "Usuarios autenticados pueden eliminar doctores" ON doctores
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas DELETE para citas
CREATE POLICY "Usuarios autenticados pueden eliminar citas" ON citas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas DELETE para historial médico
CREATE POLICY "Usuarios autenticados pueden eliminar historial" ON historial_medico
    FOR DELETE USING (auth.role() = 'authenticated');
