const Usuario = require('../models/usuario');

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, contraseña_hash } = req.body;
    const usuario = new Usuario({ nombre, email, contraseña_hash });
    await usuario.save();

    // Respuesta sin contraseña_hash
    res.status(201).json({
      mensaje: "Usuario creado",
      usuario: usuario // Gracias al toJSON(), el hash ya no se incluirá
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Ejemplo de otro método (obtener usuarios)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contraseña_hash -__v'); // Excluir campos
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};


const mongoose = require('mongoose');

exports.crearTarea = async (req, res) => {
  try {
    // Validar que usuario_id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.body.usuario_id)) {
      return res.status(400).json({ error: "El ID de usuario no es válido" });
    }

    const tarea = new Tarea(req.body);
    await tarea.save();

    const tareaRespuesta = tarea.toObject();
    delete tareaRespuesta.__v;

    res.status(201).json({
      mensaje: "Tarea creada",
      tarea: tareaRespuesta
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
