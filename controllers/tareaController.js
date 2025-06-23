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

exports.crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_entrega, prioridad, equipo_asignado } = req.body;

    const tarea = new Tarea({
      titulo,
      descripcion: descripcion || undefined,
      fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : undefined,
      prioridad: prioridad || 'media',
      equipo_asignado: equipo_asignado || undefined,
      usuario_id: req.usuario.id
    });

    await tarea.save();

    const response = tarea.toObject();
    delete response.__v;
    delete response.usuario_id;

    res.status(201).json({
      success: true,
      data: response,
      meta: {
        createdAt: tarea.createdAt,
        esEquipo: !!tarea.equipo_asignado
      }
    });

  } catch (error) {
    handleError(res, error, 'Error al crear tarea', 'TAREA_001');
  }
};

exports.obtenerTareasPorUsuario = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, prioridad, conEquipo } = req.query;
    const skip = (page - 1) * limit;

    const query = { usuario_id: req.usuario.id };
    if (estado) query.estado = estado;
    if (prioridad) query.prioridad = prioridad;
    if (conEquipo === 'true') query.equipo_asignado = { $exists: true, $ne: null };
    if (conEquipo === 'false') query.equipo_asignado = null;

    const [tareas, total] = await Promise.all([
      Tarea.find(query)
        .select('-__v -usuario_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Tarea.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: tareas,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        ...(skip + parseInt(limit) < total && { nextPage: parseInt(page) + 1 })
      }
    });

  } catch (error) {
    handleError(res, error, 'Error al obtener tareas', 'TAREA_002');
  }
};

exports.actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const camposPermitidos = ['titulo', 'descripcion', 'fecha_entrega', 'estado', 'prioridad', 'equipo_asignado'];
    const camposInvalidos = Object.keys(updates).filter(field => !camposPermitidos.includes(field));

    if (camposInvalidos.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos no permitidos: ${camposInvalidos.join(', ')}`,
        code: 'TAREA_003'
      });
    }

    const tarea = await Tarea.findOneAndUpdate(
      { _id: id, usuario_id: req.usuario.id },
      updates,
      { new: true, runValidators: true }
    ).select('-__v -usuario_id');

    if (!tarea) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada o no autorizada',
        code: 'TAREA_004'
      });
    }

    res.json({
      success: true,
      data: tarea,
      meta: {
        updatedAt: tarea.updatedAt,
        esEquipo: !!tarea.equipo_asignado
      }
    });

  } catch (error) {
    handleError(res, error, 'Error al actualizar tarea', 'TAREA_005');
  }
};

exports.eliminarTarea = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const tarea = await Tarea.findOneAndDelete({
        _id: req.params.id,
        usuario_id: req.usuario.id
      }).session(session);

      if (!tarea) {
        throw new Error('Tarea no encontrada o no autorizada');
      }

      res.json({
        success: true,
        data: {
          id: tarea._id,
          titulo: tarea.titulo,
          mensaje: 'Tarea eliminada permanentemente',
          equipoEliminado: !!tarea.equipo_asignado
        },
        meta: {
          deletedAt: new Date()
        }
      });
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, error.message || 'Error al eliminar tarea', 'TAREA_007');
  } finally {
    session.endSession();
  }
};