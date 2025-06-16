const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');

// POST /api/tareas → Crear nueva tarea
router.post('/', tareaController.crearTarea);

// GET /api/tareas/usuario/:usuarioId → Obtener tareas de un usuario
router.get('/usuario/:usuarioId', tareaController.obtenerTareasPorUsuario);

module.exports = router;