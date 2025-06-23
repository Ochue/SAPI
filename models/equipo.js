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

// Middleware para limpiar referencia en Tarea al eliminar equipo
EquipoSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc && doc.tarea_id) {
      await mongoose.model('Tarea').updateOne(
        { _id: doc.tarea_id },
        { $unset: { equipo_asignado: "" } }
      );
    }
  } catch (error) {
    console.error('Error limpiando referencia de equipo en tarea:', error);
  }
});

module.exports = mongoose.model('Equipo', EquipoSchema);