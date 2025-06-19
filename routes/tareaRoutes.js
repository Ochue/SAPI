const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const { verificarToken } = require('../middlewares/auth'); // <<-- Importa el middleware

// Todas las rutas protegidas
router.post('/', verificarToken, tareaController.crearTarea);
router.get('/usuario/:usuarioId', verificarToken, tareaController.obtenerTareasPorUsuario);

module.exports = router;