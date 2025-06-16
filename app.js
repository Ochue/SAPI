const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Carga variables del .env

const app = express();
app.use(express.json()); // Permite recibir JSON en las peticiones

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API funcionando!');
});

// ===== RUTAS PRINCIPALES =====
app.use('/api/usuarios', require('./routes/usuarioRoutes')); // Ruta de usuarios
app.use('/api/tareas', require('./routes/tareaRoutes'));
app.use('/api/recordatorios', require('./routes/recordatorioRoutes')); // ¡Esta línea debe existir!
// Aquí agregarás más rutas luego (tareas, recordatorios, etc.)

module.exports = app;