const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token no válido'
      });
    }

    // Agregar el usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token no válido'
    });
  }
};

// Middleware opcional para rutas que pueden o no requerir autenticación
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Si hay error, continuamos sin usuario
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
