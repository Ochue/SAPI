const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const { verificarToken } = require('../middlewares/auth'); // <<-- Importa el middleware

// Todas las rutas protegidas
router.post('/', verificarToken, tareaController.crearTarea);
router.get('/usuario/:usuarioId', verificarToken, tareaController.obtenerTareasPorUsuario);
// PUT /api/tareas/:id - Actualizar tarea
router.put('/:id', verificarToken, tareaController.actualizarTarea);

// DELETE /api/tareas/:id - Eliminar tarea
router.delete('/:id', verificarToken, tareaController.eliminarTarea);
module.exports = router;