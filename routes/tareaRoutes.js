const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const { verificarToken } = require('../middlewares/auth');

// POST /api/tareas - Crear nueva tarea
router.post('/', verificarToken, tareaController.crearTarea);

// GET /api/tareas - Obtener tareas del usuario
router.get('/', verificarToken, tareaController.obtenerTareasPorUsuario);

// PUT /api/tareas/:id - Actualizar tarea
router.put('/:id', verificarToken, tareaController.actualizarTarea);

// DELETE /api/tareas/:id - Eliminar tarea
router.delete('/:id', verificarToken, tareaController.eliminarTarea);

module.exports = router;