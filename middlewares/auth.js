const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  // 1. Extraer token de headers
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 2. Validar existencia del token
  if (!token) {
    return res.status(401).json({ 
      error: 'Token requerido',
      code: 'AUTH_001' // Código de error personalizado
    });
  }

  try {
    // 3. Verificar token (con manejo de errores específico)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Fuerza algoritmo seguro
      maxAge: '1h' // Coincide con expiresIn del login
    });

    // 4. Inyectar datos de usuario en el request
    req.usuario = {
      id: decoded.id,
      email: decoded.email
      // No inyectar datos sensibles
    };

    next();
  } catch (error) {
    // 5. Manejo detallado de errores
    let statusCode = 401;
    let errorMessage = 'Token inválido';

    if (error.name === 'TokenExpiredError') {
      statusCode = 403;
      errorMessage = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Firma inválida';
    }

    console.error(`Error de autenticación: ${error.message}`);
    res.status(statusCode).json({ 
      error: errorMessage,
      code: 'AUTH_002',
      detalle: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};