const mongoose = require('mongoose');

const RecordatorioSchema = new mongoose.Schema({
  tarea_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tarea', 
    required: true 
  },
  horas_antes: { type: Number, required: true }
});

module.exports = mongoose.model('Recordatorio', RecordatorioSchema);