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

// Validación flexible de líder
EquipoSchema.path('miembros').validate(function(miembros) {
  const lideres = miembros.filter(m => m.rol === 'lider');
  return lideres.length <= 1;
}, 'Solo puede haber un líder como máximo (o ninguno)');

// Limpieza de referencia en tarea
EquipoSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc?.tarea_id) {
      await mongoose.model('Tarea').findByIdAndUpdate(
        doc.tarea_id,
        { $unset: { equipo_asignado: "" } }
      );
    }
  } catch (error) {
    console.error('Error limpiando referencia en tarea:', error.message);
  }
});

module.exports = mongoose.model('Equipo', EquipoSchema);