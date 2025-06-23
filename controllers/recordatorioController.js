const Recordatorio = require('../models/Recordatorio');
const Tarea = require('../models/Tarea');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

exports.crearRecordatorio = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.tarea_id)) {
      return res.status(400).json({ error: "El ID de la tarea no es válido" });
    }

    const tareaExistente = await Tarea.findById(req.body.tarea_id);
    if (!tareaExistente) {
      return res.status(404).json({ error: "La tarea no existe" });
    }

    // Crear recordatorio, ignorando horas_antes
    const recordatorio = new Recordatorio({
      tarea_id: req.body.tarea_id,
      aviso_el_dia_entrega: true // Siempre true o puedes recibirlo en body si quieres flexibilidad
    });

    await recordatorio.save();

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const recordatorios = await Recordatorio.find({ tarea_id: req.params.tareaId }).select('-__v');
    res.json(recordatorios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener recordatorios" });
  }
};

exports.actualizarRecordatorio = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "El ID del recordatorio no es válido" });
    }

    // Solo actualizamos aviso_el_dia_entrega (o podrías omitir esta función si es fija)
    const recordatorio = await Recordatorio.findByIdAndUpdate(
      req.params.id,
      { aviso_el_dia_entrega: true },
      { new: true, runValidators: true }
    );

    if (!recordatorio) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    const recordatorioRespuesta = recordatorio.toObject();
    delete recordatorioRespuesta.__v;

    res.json({
      mensaje: "Recordatorio actualizado",
      recordatorio: recordatorioRespuesta
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarRecordatorio = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "El ID del recordatorio no es válido" });
    }

    const recordatorio = await Recordatorio.findByIdAndDelete(req.params.id);

    if (!recordatorio) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    res.json({ mensaje: "Recordatorio eliminado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
