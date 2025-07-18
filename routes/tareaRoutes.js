const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const { verificarToken } = require('../middlewares/auth');
const { check } = require('express-validator');

router.post('/', 
  verificarToken,
  [
    check('titulo', 'El título es obligatorio').not().isEmpty(),
    check('titulo', 'El título no puede exceder 100 caracteres').isLength({ max: 100 }),
    check('descripcion', 'La descripción no puede exceder 500 caracteres').optional().isLength({ max: 500 })
  ],
  tareaController.crearTarea
);

router.get('/', 
  verificarToken,
  [
    check('page', 'La página debe ser un número').optional().isInt(),
    check('limit', 'El límite debe ser un número').optional().isInt(),
    check('estado').optional().isIn(['pendiente', 'en_progreso', 'completada']),
    check('prioridad').optional().isIn(['baja', 'media', 'alta'])
  ],
  tareaController.obtenerTareasPorUsuario
);

router.put('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId(),
    check('titulo', 'El título no puede exceder 100 caracteres').optional().isLength({ max: 100 }),
    check('descripcion', 'La descripción no puede exceder 500 caracteres').optional().isLength({ max: 500 })
  ],
  tareaController.actualizarTarea
);

router.delete('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId()
  ],
  tareaController.eliminarTarea
);

router.get('/equipo/:equipoId', 
  verificarToken,
  [
    check('equipoId', 'El ID no es válido').isMongoId()
  ],
  tareaController.obtenerTareasPorEquipo
);

module.exports = router;