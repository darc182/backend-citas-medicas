const express = require('express');
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, rol = 'paciente', nombre, apellido } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, nombre y apellido son requeridos'
      });
    }

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          rol
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        status: 'error',
        message: authError.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente. Revisa tu email para confirmar la cuenta.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nombre,
          apellido,
          rol
        }
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y password son requeridos'
      });
    }

    // Iniciar sesión con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    res.json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata.nombre,
          apellido: data.user.user_metadata.apellido,
          rol: data.user.user_metadata.rol || 'paciente'
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.json({
      status: 'success',
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          nombre: req.user.user_metadata.nombre,
          apellido: req.user.user_metadata.apellido,
          rol: req.user.user_metadata.rol || 'paciente'
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
