const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { verificarToken } = require('../middlewares/auth');
const { check } = require('express-validator');

// Crear equipo
router.post('/', 
  verificarToken,
  [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre no puede exceder 100 caracteres').isLength({ max: 100 })
  ],
  equipoController.crearEquipo
);

// Obtener equipos del usuario
router.get('/', 
  verificarToken,
  [
    check('page', 'La página debe ser un número').optional().isInt(),
    check('limit', 'El límite debe ser un número').optional().isInt()
  ],
  equipoController.obtenerEquipos
);

// Obtener un equipo específico
router.get('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId()
  ],
  equipoController.obtenerEquipo
);

// Actualizar equipo
router.put('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre no puede exceder 100 caracteres').isLength({ max: 100 })
  ],
  equipoController.actualizarEquipo
);

// Eliminar equipo
router.delete('/:id', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId()
  ],
  equipoController.eliminarEquipo
);

// Agregar miembro
router.post('/:id/miembros', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId(),
    check('usuario_id', 'El ID de usuario no es válido').isMongoId(),
    check('rol').optional().isIn(['lider', 'miembro'])
  ],
  equipoController.agregarMiembro
);

// Eliminar miembro
router.delete('/:id/miembros/:miembroId', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId(),
    check('miembroId', 'El ID de miembro no es válido').isMongoId()
  ],
  equipoController.eliminarMiembro
);

// Crear proyecto
router.post('/:id/proyectos', 
  verificarToken,
  [
    check('id', 'El ID no es válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre no puede exceder 100 caracteres').isLength({ max: 100 })
  ],
  equipoController.crearProyecto
);

// Vincular tarea a proyecto
router.post('/:equipoId/proyectos/:proyectoId/tareas', 
  verificarToken,
  [
    check('equipoId', 'El ID de equipo no es válido').isMongoId(),
    check('proyectoId', 'El ID de proyecto no es válido').isMongoId(),
    check('tareaId', 'El ID de tarea no es válido').isMongoId()
  ],
  equipoController.vincularTarea
);

module.exports = router;