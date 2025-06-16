const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
  usuario_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  titulo: { type: String, required: true },
  descripcion: { type: String },
  fecha_entrega: { type: Date },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_progreso', 'completada'], 
    default: 'pendiente' 
  },
  prioridad: { 
    type: String, 
    enum: ['baja', 'media', 'alta'], 
    default: 'media' 
  },
  categoria: { type: String }
});

module.exports = mongoose.model('Tarea', TareaSchema);