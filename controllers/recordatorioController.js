const Recordatorio = require('../models/Recordatorio');
const Tarea = require('../models/Tarea');
const mongoose = require('mongoose');

exports.crearRecordatorio = async (req, res) => {
  try {
    // Validar que tarea_id sea un ObjectId válido y exista
    if (!mongoose.Types.ObjectId.isValid(req.body.tarea_id)) {
      return res.status(400).json({ error: "El ID de la tarea no es válido" });
    }

    const tareaExistente = await Tarea.findById(req.body.tarea_id);
    if (!tareaExistente) {
      return res.status(404).json({ error: "La tarea no existe" });
    }

    const recordatorio = new Recordatorio({
      tarea_id: req.body.tarea_id,
      horas_antes: req.body.horas_antes
    });

    await recordatorio.save();

    // Respuesta sin campos internos
    const recordatorioRespuesta = recordatorio.toObject();
    delete recordatorioRespuesta.__v;

    res.status(201).json({
      mensaje: "Recordatorio creado",
      recordatorio: recordatorioRespuesta
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerRecordatoriosPorTarea = async (req, res) => {
  try {
    const recordatorios = await Recordatorio.find({ tarea_id: req.params.tareaId })
      .select('-__v');

    res.json(recordatorios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener recordatorios" });
  }
};