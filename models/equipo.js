const mongoose = require('mongoose');

const MiembroSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  rol: {
    type: String,
    enum: ['lider', 'miembro'],
    default: 'miembro'
  },
  fecha_union: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ProyectoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  tareas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tarea'
  }]
}, { timestamps: true });

const EquipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  miembros: [MiembroSchema],
  proyectos: [ProyectoSchema],
  creado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validación: Solo un líder por equipo
EquipoSchema.path('miembros').validate(function(miembros) {
  const lideres = miembros.filter(m => m.rol === 'lider');
  return lideres.length <= 1;
}, 'Solo puede haber un líder por equipo');

module.exports = mongoose.model('Equipo', EquipoSchema);
