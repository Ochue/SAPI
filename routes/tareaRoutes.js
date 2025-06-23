const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const { verificarToken } = require('../middlewares/auth');
const { check } = require('express-validator');

// POST /api/tareas - Crear nueva tarea
router.post('/', 
  verificarToken,
  [
    check('titulo', 'El título es obligatorio').not().isEmpty(),
    check('titulo', 'El título no puede exceder 100 caracteres').isLength({ max: 100 }),
    check('descripcion', 'La descripción no puede exceder 500 caracteres').optional().isLength({ max: 500 }),
    check('categoria', 'La categoría no puede exceder 50 caracteres').optional().isLength({ max: 50 }),
    check('equipo_asignado', 'El ID de equipo no es válido').optional().isMongoId()
  ],
  tareaController.crearTarea
);

// GET /api/tareas - Obtener tareas del usuario
router.get('/', 
  verificarToken,
  [
    check('page', 'La página debe ser un número').optional().isInt(),
    check('limit', 'El límite debe ser un número').optional().isInt(),
    check('estado').optional().isIn(['pendiente', 'en_progreso', 'completada']),
    check('prioridad').optional().isIn(['baja', 'media', 'alta']),
    check('conEquipo').optional().isIn(['true', 'false'])
  ],
  tareaController.obtenerTareasPorUsuario
);

// PUT /api/tareas/:id - Actualizar tarea
router.put('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId(),
    check('titulo', 'El título no puede exceder 100 caracteres').optional().isLength({ max: 100 }),
    check('descripcion', 'La descripción no puede exceder 500 caracteres').optional().isLength({ max: 500 }),
    check('categoria', 'La categoría no puede exceder 50 caracteres').optional().isLength({ max: 50 }),
    check('equipo_asignado', 'El ID de equipo no es válido').optional().isMongoId()
  ],
  tareaController.actualizarTarea
);

// DELETE /api/tareas/:id - Eliminar tarea
router.delete('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId()
  ],
  tareaController.eliminarTarea
);

module.exports = router;