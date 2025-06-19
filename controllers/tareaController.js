const Tarea = require('../models/Tarea');

exports.crearTarea = async (req, res) => {
  try {
    // 1. Validación del título (usuario_id ahora viene del token)
    if (!req.body.titulo) {
      return res.status(400).json({ error: "El título es requerido" });
    }

    // 2. Crear la tarea con el usuario_id del token
    const tarea = new Tarea({
      ...req.body,
      usuario_id: req.usuario.id // <<-- Aquí usamos el ID del usuario autenticado
    });

    await tarea.save();

    // 3. Preparar respuesta sin campos internos
    const tareaRespuesta = tarea.toObject();
    delete tareaRespuesta.__v;

    res.status(201).json({
      mensaje: "Tarea creada",
      tarea: tareaRespuesta
    });

  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      // Detalles adicionales solo en desarrollo
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

exports.obtenerTareasPorUsuario = async (req, res) => {
  try {
    // Obtener tareas SOLO del usuario autenticado
    const tareas = await Tarea.find({ usuario_id: req.usuario.id }) // <<-- Cambio clave
      .select('-__v')
      .lean();

    res.json(tareas);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener tareas",
      ...(process.env.NODE_ENV === 'development' && { detalle: error.message })
    });
  }
};