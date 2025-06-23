const mongoose = require('mongoose');

const RecordatorioSchema = new mongoose.Schema({
  tarea_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tarea', 
    required: true 
  },
  aviso_el_dia_entrega: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Recordatorio', RecordatorioSchema);
