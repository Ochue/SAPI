const Equipo = require('../models/equipo');
const Tarea = require('../models/Tarea');
const Usuario = require('../models/Usuario');

exports.crearEquipo = async (req, res) => {
  try {
    const { tarea_id, miembros } = req.body;

    // Validar que la tarea exista
    const tarea = await Tarea.findById(tarea_id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Validar usuarios
    const usuariosValidos = await Promise.all(
      miembros.map(async miembro => {
        const usuario = await Usuario.findById(miembro.usuario_id);
        return usuario ? miembro : null;
      })
    ).then(results => results.filter(Boolean));

    if (usuariosValidos.length !== miembros.length) {
      return res.status(400).json({ error: 'Algunos usuarios no existen' });
    }

    // Validar solo un líder
    const lideres = miembros.filter(m => m.rol === 'lider');
    if (lideres.length !== 1) {
      return res.status(400).json({ error: 'Debe haber exactamente un líder' });
    }

    const equipo = new Equipo({
      tarea_id,
      miembros: usuariosValidos,
      creado_por: req.usuario.id
    });

    await equipo.save();

    // Asignar equipo a la tarea
    tarea.equipo_asignado = equipo._id;
    await tarea.save();

    res.status(201).json(equipo);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerEquipoPorTarea = async (req, res) => {
  try {
    const { tarea_id } = req.params;
    const equipo = await Equipo.findOne({ tarea_id })
      .populate('miembros.usuario_id', 'nombre email')
      .populate('creado_por', 'nombre');

    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json(equipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarMiembros = async (req, res) => {
  try {
    const { equipo_id } = req.params;
    const { miembros } = req.body;

    const equipo = await Equipo.findById(equipo_id);
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Validar liderazgo (solo líder o creador puede modificar)
    const esLider = equipo.miembros.some(
      m => m.usuario_id.toString() === req.usuario.id && m.rol === 'lider'
    );
    const esCreador = equipo.creado_por.toString() === req.usuario.id;

    if (!esLider && !esCreador) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Actualizar miembros
    equipo.miembros = miembros;
    await equipo.save();

    res.json(equipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};