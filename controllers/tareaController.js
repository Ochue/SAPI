const Tarea = require('../models/Tarea');

exports.crearTarea = async (req, res) => {
  try {
    // Validación básica: título y usuario_id son obligatorios
    if (!req.body.titulo || !req.body.usuario_id) {
      return res.status(400).json({ error: "Título y usuario_id son campos requeridos" });
    }

    const tarea = new Tarea(req.body);
    await tarea.save();

    // Respuesta sin campos internos (como __v)
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

exports.obtenerTareasPorUsuario = async (req, res) => {
  try {
    const tareas = await Tarea.find({ usuario_id: req.params.usuarioId })
      .select('-__v'); // Excluir campo __v

    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
};