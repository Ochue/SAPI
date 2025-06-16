const express = require('express');
const router = express.Router();
const recordatorioController = require('../controllers/recordatorioController');

// POST /api/recordatorios → Crear recordatorio
router.post('/', recordatorioController.crearRecordatorio);

// GET /api/recordatorios/tarea/:tareaId → Obtener recordatorios de una tarea
router.get('/tarea/:tareaId', recordatorioController.obtenerRecordatoriosPorTarea);

module.exports = router;