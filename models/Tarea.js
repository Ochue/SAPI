const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
  usuario_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  titulo: { 
    type: String, 
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  descripcion: { 
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  fecha_entrega: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'La fecha de entrega debe ser futura'
    }
  },
  estado: { 
    type: String, 
    enum: {
      values: ['pendiente', 'en_progreso', 'completada'],
      message: 'Estado no válido'
    }, 
    default: 'pendiente' 
  },
  prioridad: { 
    type: String, 
    enum: {
      values: ['baja', 'media', 'alta'],
      message: 'Prioridad no válida'
    }, 
    default: 'media' 
  },
  equipo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo'
  },
  proyecto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo.proyectos'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Tarea', TareaSchema);