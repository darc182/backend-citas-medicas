const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/pacientes
// @desc    Obtener todos los pacientes
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select(`
        *,
        citas(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      data: {
        pacientes: data,
        total: data.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/pacientes/:id
// @desc    Obtener un paciente por ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pacientes')
      .select(`
        *,
        citas(
          *,
          doctores(nombre, apellido, especialidad)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      status: 'success',
      data: {
        paciente: data
      }
    });

  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/pacientes
// @desc    Crear nuevo paciente
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      cedula,
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      direccion,
      tipo_sangre,
      alergias,
      enfermedades_cronicas,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono
    } = req.body;

    // Validaciones básicas
    if (!cedula || !nombre || !apellido || !email || !telefono) {
      return res.status(400).json({
        status: 'error',
        message: 'Cédula, nombre, apellido, email y teléfono son requeridos'
      });
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert([{
        cedula,
        nombre,
        apellido,
        email,
        telefono,
        fecha_nacimiento,
        genero,
        direccion,
        tipo_sangre,
        alergias,
        enfermedades_cronicas,
        contacto_emergencia_nombre,
        contacto_emergencia_telefono,
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
      message: 'Paciente creado exitosamente',
      data: {
        paciente: data
      }
    });

  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/pacientes/:id
// @desc    Actualizar paciente
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== DEBUG PUT PACIENTES ===');
    console.log('ID:', id);
    console.log('Body recibido:', req.body);
    
    const updateData = { ...req.body };
    delete updateData.id; // No permitir actualizar el ID
    delete updateData.created_at; // No permitir actualizar fecha de creación
    delete updateData.citas; // Eliminar datos relacionales
    
    console.log('Datos a actualizar:', updateData);

    const { data, error } = await supabase
      .from('pacientes')
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
      message: 'Paciente actualizado exitosamente',
      data: {
        paciente: data
      }
    });

  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
      details: error.message
    });
  }
});

// @route   DELETE /api/pacientes/:id
// @desc    Eliminar paciente
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pacientes')
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
      message: 'Paciente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando paciente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/pacientes/:id/citas
// @desc    Obtener historial de citas de un paciente
// @access  Private
router.get('/:id/citas', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        doctores(nombre, apellido, especialidad),
        pacientes(nombre, apellido)
      `)
      .eq('paciente_id', id)
      .order('fecha', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

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
    console.error('Error obteniendo citas del paciente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
