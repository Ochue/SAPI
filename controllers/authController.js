const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

exports.login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
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

    // 3. Generar token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Eliminar campos sensibles de la respuesta
    delete usuario.contraseña_hash;
    delete usuario.__v;

    res.json({ token, usuario });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};