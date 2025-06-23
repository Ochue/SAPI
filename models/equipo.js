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
});

const EquipoSchema = new mongoose.Schema({
  tarea_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tarea',
    required: true,
    unique: true
  },
  miembros: [MiembroSchema],
  creado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, { timestamps: true });

// Validación: Solo un líder por equipo
EquipoSchema.path('miembros').validate(function(miembros) {
  const lideres = miembros.filter(m => m.rol === 'lider');
  return lideres.length <= 1;
}, 'Solo puede haber un líder por equipo');

module.exports = mongoose.model('Equipo', EquipoSchema);