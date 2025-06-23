const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { verificarToken } = require('../middlewares/auth');

// Crear equipo para tarea
router.post('/', verificarToken, equipoController.crearEquipo);

// Obtener equipo por tarea
router.get('/tarea/:tarea_id', verificarToken, equipoController.obtenerEquipoPorTarea);

// Actualizar miembros
router.put('/:equipo_id/miembros', verificarToken, equipoController.actualizarMiembros);

module.exports = router;