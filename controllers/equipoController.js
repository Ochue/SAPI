const Equipo = require('../models/equipo');
const Tarea = require('../models/Tarea');
const mongoose = require('mongoose');

const handleError = (res, error, defaultMessage, code) => {
  console.error(`[Error ${code}]`, error);
  const response = {
    error: defaultMessage,
    code: code,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      ...(error.name === 'ValidationError' && {
        detalles: Object.values(error.errors).map(e => e.message)
      })
    })
  };
  return res.status(code >= 500 ? 500 : 400).json(response);
};

// Crear equipo
exports.crearEquipo = async (req, res) => {
  try {
    const { nombre } = req.body;

    const equipo = new Equipo({
      nombre,
      creado_por: req.usuario.id
    });

    await equipo.save();

    res.status(201).json({
      success: true,
      data: equipo
    });

  } catch (error) {
    handleError(res, error, 'Error al crear equipo', 'EQUIPO_001');
  }
};

// Obtener equipos del usuario
exports.obtenerEquipos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      $or: [
        { 'miembros.usuario_id': req.usuario.id },
        { creado_por: req.usuario.id }
      ]
    };

    const [equipos, total] = await Promise.all([
      Equipo.find(query)
        .populate('creado_por', 'nombre email')
        .populate('miembros.usuario_id', 'nombre email')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Equipo.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: equipos,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    handleError(res, error, 'Error al obtener equipos', 'EQUIPO_002');
  }
};

// Obtener un equipo específico
exports.obtenerEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findOne({
      _id: req.params.id,
      $or: [
        { 'miembros.usuario_id': req.usuario.id },
        { creado_por: req.usuario.id }
      ]
    })
    .populate('creado_por', 'nombre email')
    .populate('miembros.usuario_id', 'nombre email avatar')
    .populate('proyectos.tareas', 'titulo estado');

    if (!equipo) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado o no autorizado',
        code: 'EQUIPO_003'
      });
    }

    res.json({
      success: true,
      data: equipo
    });

  } catch (error) {
    handleError(res, error, 'Error al obtener equipo', 'EQUIPO_004');
  }
};

// Actualizar equipo
exports.actualizarEquipo = async (req, res) => {
  try {
    const { nombre } = req.body;

    const equipo = await Equipo.findOneAndUpdate(
      { 
        _id: req.params.id,
        creado_por: req.usuario.id // Solo el creador puede editar
      },
      { nombre },
      { new: true, runValidators: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado o no autorizado',
        code: 'EQUIPO_005'
      });
    }

    res.json({
      success: true,
      data: equipo
    });

  } catch (error) {
    handleError(res, error, 'Error al actualizar equipo', 'EQUIPO_006');
  }
};

// Eliminar equipo
exports.eliminarEquipo = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const equipo = await Equipo.findOneAndDelete({
        _id: req.params.id,
        creado_por: req.usuario.id // Solo el creador puede eliminar
      }).session(session);

      if (!equipo) {
        throw new Error('Equipo no encontrado o no autorizado');
      }

      // Limpiar referencias en tareas
      await Tarea.updateMany(
        { equipo_id: equipo._id },
        { $unset: { equipo_id: 1, proyecto_id: 1 } },
        { session }
      );

      res.json({
        success: true,
        data: {
          id: equipo._id,
          nombre: equipo.nombre,
          mensaje: 'Equipo eliminado permanentemente'
        }
      });
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, error.message || 'Error al eliminar equipo', 'EQUIPO_007');
  } finally {
    session.endSession();
  }
};

// Agregar miembro a equipo
exports.agregarMiembro = async (req, res) => {
  try {
    const { usuario_id, rol } = req.body;

    const equipo = await Equipo.findOneAndUpdate(
      { 
        _id: req.params.id,
        creado_por: req.usuario.id // Solo el creador puede agregar miembros
      },
      {
        $addToSet: {
          miembros: {
            usuario_id,
            rol: rol || 'miembro'
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('miembros.usuario_id', 'nombre email');

    if (!equipo) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado o no autorizado',
        code: 'EQUIPO_008'
      });
    }

    res.json({
      success: true,
      data: equipo.miembros
    });

  } catch (error) {
    handleError(res, error, 'Error al agregar miembro', 'EQUIPO_009');
  }
};

// Eliminar miembro de equipo
exports.eliminarMiembro = async (req, res) => {
  try {
    const equipo = await Equipo.findOneAndUpdate(
      { 
        _id: req.params.id,
        creado_por: req.usuario.id // Solo el creador puede eliminar miembros
      },
      {
        $pull: {
          miembros: { usuario_id: req.params.miembroId }
        }
      },
      { new: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado o no autorizado',
        code: 'EQUIPO_010'
      });
    }

    res.json({
      success: true,
      data: equipo.miembros
    });

  } catch (error) {
    handleError(res, error, 'Error al eliminar miembro', 'EQUIPO_011');
  }
};

// Crear proyecto en equipo
exports.crearProyecto = async (req, res) => {
  try {
    const { nombre } = req.body;

    const equipo = await Equipo.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { 'miembros.usuario_id': req.usuario.id },
          { creado_por: req.usuario.id }
        ]
      },
      {
        $push: {
          proyectos: { nombre }
        }
      },
      { new: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado o no autorizado',
        code: 'EQUIPO_012'
      });
    }

    const proyecto = equipo.proyectos[equipo.proyectos.length - 1];

    res.status(201).json({
      success: true,
      data: proyecto
    });

  } catch (error) {
    handleError(res, error, 'Error al crear proyecto', 'EQUIPO_013');
  }
};

// Vincular tarea a proyecto
exports.vincularTarea = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { equipoId, proyectoId } = req.params;
      const { tareaId } = req.body;

      // 1. Verificar que el usuario tiene acceso al equipo
      const equipo = await Equipo.findOne({
        _id: equipoId,
        $or: [
          { 'miembros.usuario_id': req.usuario.id },
          { creado_por: req.usuario.id }
        ]
      }).session(session);

      if (!equipo) {
        throw new Error('Equipo no encontrado o no autorizado');
      }

      // 2. Verificar que el proyecto existe en el equipo
      const proyecto = equipo.proyectos.id(proyectoId);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }

      // 3. Verificar que la tarea existe y pertenece al usuario
      const tarea = await Tarea.findOne({
        _id: tareaId,
        usuario_id: req.usuario.id
      }).session(session);

      if (!tarea) {
        throw new Error('Tarea no encontrada o no autorizada');
      }

      // 4. Actualizar ambas partes
      await Equipo.updateOne(
        { _id: equipoId, 'proyectos._id': proyectoId },
        { $addToSet: { 'proyectos.$.tareas': tareaId } },
        { session }
      );

      await Tarea.findByIdAndUpdate(
        tareaId,
        { 
          equipo_id: equipoId,
          proyecto_id: proyectoId
        },
        { session }
      );

      res.json({
        success: true,
        data: {
          equipo: equipoId,
          proyecto: proyectoId,
          tarea: tareaId
        }
      });
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, error.message || 'Error al vincular tarea', 'EQUIPO_014');
  } finally {
    session.endSession();
  }
};