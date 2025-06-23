const express = require('express');
const router = express.Router();
const recordatorioController = require('../controllers/recordatorioController');
const { verificarToken } = require('../middlewares/auth');
const { check } = require('express-validator');

// Crear recordatorio
router.post(
  '/',
  verificarToken,
  [
    check('tarea_id', 'El ID de la tarea no es válido').isMongoId(),
    check('horas_antes', 'Las horas antes deben ser un número positivo').isInt({ min: 1 })
  ],
  recordatorioController.crearRecordatorio
);

// Obtener recordatorios de una tarea
router.get(
  '/tarea/:tareaId',
  verificarToken,
  [
    check('tareaId', 'El ID de la tarea no es válido').isMongoId()
  ],
  recordatorioController.obtenerRecordatoriosPorTarea
);

// Actualizar recordatorio
router.put(
  '/:id',
  verificarToken,
  [
    check('id', 'El ID del recordatorio no es válido').isMongoId(),
    check('horas_antes', 'Las horas antes deben ser un número positivo').isInt({ min: 1 })
  ],
  recordatorioController.actualizarRecordatorio
);

// Eliminar recordatorio
router.delete(
  '/:id',
  verificarToken,
  [
    check('id', 'El ID del recordatorio no es válido').isMongoId()
  ],
  recordatorioController.eliminarRecordatorio
);

module.exports = router;
