const Tarea = require('../models/Tarea');

exports.crearTarea = async (req, res) => {
  try {
    // 1. Validación mejorada del request
    if (!req.body.titulo || typeof req.body.titulo !== 'string') {
      return res.status(400).json({ 
        error: "El título es requerido y debe ser texto",
        code: "TAREA_001"
      });
    }

    // 2. Validar prioridad si existe
    if (req.body.prioridad && !['baja', 'media', 'alta'].includes(req.body.prioridad)) {
      return res.status(400).json({
        error: "Prioridad inválida (debe ser: baja, media o alta)",
        code: "TAREA_002"
      });
    }

    // 3. Crear tarea con datos sanitizados
    const tarea = new Tarea({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion || null,
      prioridad: req.body.prioridad || 'media',
      estado: 'pendiente', // Valor por defecto
      usuario_id: req.usuario.id, // Del middleware de autenticación
      ...(req.body.fecha_entrega && { fecha_entrega: new Date(req.body.fecha_entrega) })
    });

    await tarea.save();

    // 4. Preparar respuesta segura
    const tareaRespuesta = {
      id: tarea._id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      prioridad: tarea.prioridad,
      estado: tarea.estado,
      fecha_creacion: tarea.createdAt,
      ...(tarea.fecha_entrega && { fecha_entrega: tarea.fecha_entrega })
    };

    res.status(201).json({
      success: true,
      data: tareaRespuesta
    });

  } catch (error) {
    console.error('[Error crearTarea]', error);
    
    // Manejo especial para errores de MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Error de validación",
        detalles: Object.values(error.errors).map(e => e.message),
        code: "TAREA_003"
      });
    }

    res.status(500).json({ 
      error: "Error interno del servidor",
      code: "TAREA_500",
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

exports.obtenerTareasPorUsuario = async (req, res) => {
  try {
    // 1. Paginación y filtros
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Construir query con filtros opcionales
    const query = { usuario_id: req.usuario.id };
    if (req.query.estado) query.estado = req.query.estado;
    if (req.query.prioridad) query.prioridad = req.query.prioridad;

    // 3. Obtener tareas con paginación
    const tareas = await Tarea.find(query)
      .select('-__v -usuario_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 4. Obtener conteo total para paginación
    const total = await Tarea.countDocuments(query);

    res.json({
      success: true,
      data: tareas,
      meta: {
        total,
        page,
        limit,
        hasNextPage: (skip + limit) < total
      }
    });

  } catch (error) {
    console.error('[Error obtenerTareas]', error);
    
    res.status(500).json({ 
      error: "Error al obtener tareas",
      code: "TAREA_501",
      ...(process.env.NODE_ENV === 'development' && { 
        detalle: error.message,
        query: req.query 
      })
    });
  }
};