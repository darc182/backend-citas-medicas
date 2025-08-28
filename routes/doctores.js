const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/doctores
// @desc    Obtener todos los doctores
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { especialidad, disponible } = req.query;
    
    let query = supabase
      .from('doctores')
      .select(`
        *,
        citas(count)
      `)
      .order('created_at', { ascending: false });

    // Filtros opcionales
    if (especialidad) {
      query = query.ilike('especialidad', `%${especialidad}%`);
    }
    
    if (disponible !== undefined) {
      query = query.eq('disponible', disponible === 'true');
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
        doctores: data,
        total: data.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo doctores:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/doctores/:id
// @desc    Obtener un doctor por ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('doctores')
      .select(`
        *,
        citas(
          *,
          pacientes(nombre, apellido, cedula)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor no encontrado'
      });
    }

    res.json({
      status: 'success',
      data: {
        doctor: data
      }
    });

  } catch (error) {
    console.error('Error obteniendo doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/doctores
// @desc    Crear nuevo doctor
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      cedula,
      nombre,
      apellido,
      email,
      telefono,
      especialidad,
      numero_licencia,
      universidad,
      experiencia_anos,
      consulta_precio,
      horario_atencion,
      dias_disponibles,
      disponible = true
    } = req.body;

    // Validaciones básicas
    if (!cedula || !nombre || !apellido || !email || !especialidad || !numero_licencia) {
      return res.status(400).json({
        status: 'error',
        message: 'Cédula, nombre, apellido, email, especialidad y número de licencia son requeridos'
      });
    }

    const { data, error } = await supabase
      .from('doctores')
      .insert([{
        cedula,
        nombre,
        apellido,
        email,
        telefono,
        especialidad,
        numero_licencia,
        universidad,
        experiencia_anos,
        consulta_precio,
        horario_atencion,
        dias_disponibles,
        disponible,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Doctor creado exitosamente',
      data: {
        doctor: data
      }
    });

  } catch (error) {
    console.error('Error creando doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/doctores/:id
// @desc    Actualizar doctor
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== DEBUG PUT DOCTORES ===');
    console.log('ID:', id);
    console.log('Body recibido:', req.body);
    
    const updateData = { ...req.body };
    delete updateData.id; // No permitir actualizar el ID
    delete updateData.created_at; // No permitir actualizar fecha de creación
    delete updateData.citas; // Eliminar datos relacionales
    
    console.log('Datos a actualizar:', updateData);

    const { data, error } = await supabase
      .from('doctores')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message,
        details: error
      });
    }

    res.json({
      status: 'success',
      message: 'Doctor actualizado exitosamente',
      data: {
        doctor: data
      }
    });

  } catch (error) {
    console.error('Error actualizando doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/doctores/:id
// @desc    Eliminar doctor
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el doctor tiene citas programadas
    const { data: citasPendientes } = await supabase
      .from('citas')
      .select('id')
      .eq('doctor_id', id)
      .eq('estado', 'programada');

    if (citasPendientes && citasPendientes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar el doctor porque tiene citas programadas'
      });
    }

    const { error } = await supabase
      .from('doctores')
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
      message: 'Doctor eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/doctores/:id/citas
// @desc    Obtener agenda de citas de un doctor
// @access  Private
router.get('/:id/citas', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, estado } = req.query;

    let query = supabase
      .from('citas')
      .select(`
        *,
        pacientes(nombre, apellido, cedula, telefono),
        doctores(nombre, apellido, especialidad)
      `)
      .eq('doctor_id', id)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    // Filtros opcionales
    if (fecha_inicio) {
      query = query.gte('fecha', fecha_inicio);
    }
    
    if (fecha_fin) {
      query = query.lte('fecha', fecha_fin);
    }
    
    if (estado) {
      query = query.eq('estado', estado);
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
    console.error('Error obteniendo citas del doctor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/doctores/especialidades
// @desc    Obtener lista de especialidades disponibles
// @access  Private
router.get('/meta/especialidades', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctores')
      .select('especialidad')
      .not('especialidad', 'is', null);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    // Obtener especialidades únicas
    const especialidades = [...new Set(data.map(item => item.especialidad))];

    res.json({
      status: 'success',
      data: {
        especialidades: especialidades.sort()
      }
    });

  } catch (error) {
    console.error('Error obteniendo especialidades:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
