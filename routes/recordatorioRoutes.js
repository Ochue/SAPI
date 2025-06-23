const express = require('express');
const router = express.Router();
const recordatorioController = require('../controllers/recordatorioController');
const { check } = require('express-validator');

// Crear recordatorio
router.post(
  '/',
  [
    check('tarea_id', 'El ID de la tarea es obligatorio y debe ser válido').isMongoId()
  ],
  recordatorioController.crearRecordatorio
);

// Obtener recordatorios por tarea
router.get(
  '/tarea/:tareaId',
  [
    check('tareaId', 'El ID de la tarea no es válido').isMongoId()
  ],
  recordatorioController.obtenerRecordatoriosPorTarea
);

// Actualizar recordatorio
router.put(
  '/:id',
  [
    check('id', 'El ID del recordatorio no es válido').isMongoId()
  ],
  recordatorioController.actualizarRecordatorio
);

// Eliminar recordatorio
router.delete(
  '/:id',
  [
    check('id', 'El ID del recordatorio no es válido').isMongoId()
  ],
  recordatorioController.eliminarRecordatorio
);

module.exports = router;
