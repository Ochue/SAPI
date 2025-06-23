const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  // 1. Extraer token de múltiples fuentes (Header, Query, Cookies)
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.query.token || 
                req.cookies?.token;

  // 2. Validación estructurada
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_001',
      docs: 'https://tu-api.com/docs/errors#AUTH_001'
    });
  }

  try {
    // 3. Verificación robusta
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 30, // 30 segundos de tolerancia
      ignoreExpiration: false // Forzar validación de expiración
    });

    // 4. Inyección segura de datos
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol || 'usuario' // Valor por defecto
    };

    // 5. Refresh token implícito (opcional)
    res.set('X-Token-Expires', new Date(decoded.exp * 1000).toISOString());

    next();
  } catch (error) {
    // 6. Manejo granular de errores
    const errorMap = {
      TokenExpiredError: {
        status: 403,
        message: 'Sesión expirada',
        code: 'AUTH_002'
      },
      JsonWebTokenError: {
        status: 401,
        message: 'Token malformado',
        code: 'AUTH_003'
      },
      NotBeforeError: {
        status: 401,
        message: 'Token no activo',
        code: 'AUTH_004'
      }
    };

    const errorInfo = errorMap[error.name] || { 
      status: 500, 
      message: 'Error de autenticación',
      code: 'AUTH_000'
    };

    console.error(`[${errorInfo.code}] ${error.message}`);
    
    res.status(errorInfo.status).json({
      success: false,
      error: errorInfo.message,
      code: errorInfo.code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        metadata: {
          receivedToken: token.slice(0, 10) + '...', // Log parcial
          errorName: error.name
        }
      })
    });
  }
};

// Middleware adicional para roles (opcional)
exports.verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso no autorizado',
        code: 'AUTH_005',
        requiredRoles: rolesPermitidos,
        currentRole: req.usuario.rol
      });
    }
    next();
  };
};