const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/citas
// @desc    Obtener todas las citas con filtros
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      fecha_inicio, 
      fecha_fin, 
      estado, 
      doctor_id, 
      paciente_id,
      limit = 50,
      offset = 0
    } = req.query;

    let query = supabase
      .from('citas')
      .select(`
        *,
        doctores(id, nombre, apellido, especialidad),
        pacientes(id, nombre, apellido, cedula, telefono)
      `)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Aplicar filtros
    if (fecha_inicio) {
      query = query.gte('fecha', fecha_inicio);
    }
    
    if (fecha_fin) {
      query = query.lte('fecha', fecha_fin);
    }
    
    if (estado) {
      query = query.eq('estado', estado);
    }
    
    if (doctor_id) {
      query = query.eq('doctor_id', doctor_id);
    }
    
    if (paciente_id) {
      query = query.eq('paciente_id', paciente_id);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      data: {
        citas: data,
        total: data.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/citas/:id
// @desc    Obtener una cita por ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        doctores(
          id, nombre, apellido, especialidad, 
          email, telefono, consulta_precio
        ),
        pacientes(
          id, nombre, apellido, cedula, email, 
          telefono, fecha_nacimiento, tipo_sangre, alergias
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        status: 'error',
        message: 'Cita no encontrada'
      });
    }

    res.json({
      status: 'success',
      data: {
        cita: data
      }
    });

  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/citas
// @desc    Crear nueva cita
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      paciente_id,
      doctor_id,
      fecha,
      hora,
      motivo_consulta,
      tipo_cita = 'consulta',
      estado = 'programada',
      notas
    } = req.body;

    // Validaciones básicas
    if (!paciente_id || !doctor_id || !fecha || !hora || !motivo_consulta) {
      return res.status(400).json({
        status: 'error',
        message: 'Paciente, doctor, fecha, hora y motivo de consulta son requeridos'
      });
    }

    // Verificar que el doctor esté disponible en esa fecha y hora
    const { data: citasExistentes } = await supabase
      .from('citas')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('fecha', fecha)
      .eq('hora', hora)
      .eq('estado', 'programada');

    if (citasExistentes && citasExistentes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El doctor ya tiene una cita programada en esa fecha y hora'
      });
    }

    // Verificar que el paciente no tenga otra cita en la misma fecha y hora
    const { data: citasPaciente } = await supabase
      .from('citas')
      .select('id')
      .eq('paciente_id', paciente_id)
      .eq('fecha', fecha)
      .eq('hora', hora)
      .eq('estado', 'programada');

    if (citasPaciente && citasPaciente.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El paciente ya tiene una cita programada en esa fecha y hora'
      });
    }

    const { data, error } = await supabase
      .from('citas')
      .insert([{
        paciente_id,
        doctor_id,
        fecha,
        hora,
        motivo_consulta,
        tipo_cita,
        estado,
        notas,
        created_by: req.user.id
      }])
      .select(`
        *,
        doctores(nombre, apellido, especialidad),
        pacientes(nombre, apellido, cedula)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Cita creada exitosamente',
      data: {
        cita: data
      }
    });

  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/citas/:id
// @desc    Actualizar cita
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== DEBUG PUT CITAS ===');
    console.log('ID:', id);
    console.log('Body recibido:', req.body);
    
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.doctores; // Eliminar datos relacionales
    delete updateData.pacientes; // Eliminar datos relacionales
    delete updateData.codigo; // El código no debe actualizarse manualmente
    
    console.log('Datos a actualizar:', updateData);

    // Si se está actualizando la fecha/hora, verificar disponibilidad
    if ((updateData.fecha || updateData.hora) && updateData.doctor_id) {
      const { data: citasExistentes } = await supabase
        .from('citas')
        .select('id')
        .eq('doctor_id', updateData.doctor_id)
        .eq('fecha', updateData.fecha)
        .eq('hora', updateData.hora)
        .eq('estado', 'programada')
        .neq('id', id); // Excluir la cita actual

      if (citasExistentes && citasExistentes.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El doctor ya tiene una cita programada en esa fecha y hora'
        });
      }
    }

    const { data, error } = await supabase
      .from('citas')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        doctores(nombre, apellido, especialidad),
        pacientes(nombre, apellido, cedula)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      message: 'Cita actualizada exitosamente',
      data: {
        cita: data
      }
    });

  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/citas/:id
// @desc    Eliminar/Cancelar cita
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelar_solamente = false } = req.query;

    if (cancelar_solamente === 'true') {
      // Solo cambiar el estado a cancelada
      const { data, error } = await supabase
        .from('citas')
        .update({
          estado: 'cancelada',
          notas: `${req.body.notas || ''} - Cancelada el ${new Date().toISOString()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }

      return res.json({
        status: 'success',
        message: 'Cita cancelada exitosamente',
        data: { cita: data }
      });
    }

    // Eliminar completamente
    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      message: 'Cita eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando cita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/citas/disponibilidad/:doctor_id
// @desc    Obtener horarios disponibles de un doctor
// @access  Private
router.get('/disponibilidad/:doctor_id', authMiddleware, async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        status: 'error',
        message: 'La fecha es requerida'
      });
    }

    // Obtener información del doctor
    const { data: doctor } = await supabase
      .from('doctores')
      .select('horario_atencion, dias_disponibles')
      .eq('id', doctor_id)
      .single();

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor no encontrado'
      });
    }

    // Obtener citas ya programadas para esa fecha
    const { data: citasOcupadas } = await supabase
      .from('citas')
      .select('hora')
      .eq('doctor_id', doctor_id)
      .eq('fecha', fecha)
      .eq('estado', 'programada');

    const horasOcupadas = citasOcupadas ? citasOcupadas.map(cita => cita.hora) : [];

    // Generar horarios disponibles (ejemplo básico)
    const horariosBase = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    const horariosDisponibles = horariosBase.filter(hora => 
      !horasOcupadas.includes(hora)
    );

    res.json({
      status: 'success',
      data: {
        fecha,
        horarios_disponibles: horariosDisponibles,
        horarios_ocupados: horasOcupadas
      }
    });

  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/citas/estadisticas
// @desc    Obtener estadísticas de citas
// @access  Private
router.get('/meta/estadisticas', authMiddleware, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = supabase.from('citas').select('estado, created_at');
    
    if (fecha_inicio) {
      query = query.gte('created_at', fecha_inicio);
    }
    
    if (fecha_fin) {
      query = query.lte('created_at', fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    // Calcular estadísticas
    const estadisticas = {
      total_citas: data.length,
      programadas: data.filter(c => c.estado === 'programada').length,
      completadas: data.filter(c => c.estado === 'completada').length,
      canceladas: data.filter(c => c.estado === 'cancelada').length,
      no_asistio: data.filter(c => c.estado === 'no_asistio').length
    };

    res.json({
      status: 'success',
      data: estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
