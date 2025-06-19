const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

exports.login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // 0. Validación crítica del JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no configurado en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // 1. Buscar usuario incluyendo explícitamente el campo contraseña_hash
    const usuario = await Usuario.findOne({ email }).select('+contraseña_hash').lean();

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 2. Comparar contraseñas directamente
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña_hash);
    
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 3. Generar token JWT con verificación adicional
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET, // Asegúrate que esto tenga valor
      { expiresIn: '1h' }
    );

    // 4. Eliminar campos sensibles de la respuesta
    const usuarioRespuesta = { ...usuario };
    delete usuarioRespuesta.contraseña_hash;
    delete usuarioRespuesta.__v;

    res.json({ token, usuario: usuarioRespuesta });

  } catch (error) {
    console.error('Error en login:', error);
    
    // Respuesta detallada en desarrollo
    const respuestaError = {
      error: 'Error en el servidor',
      ...(process.env.NODE_ENV === 'development' && {
        detalle: error.message,
        stack: error.stack
      })
    };
    
    res.status(500).json(respuestaError);
  }
};