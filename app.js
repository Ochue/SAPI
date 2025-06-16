const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // <-- Esta línea YA carga las variables (no necesitas la segunda llamada)

const app = express();

// Middlewares
app.use(express.json()); // Permite recibir JSON en las peticiones

// Conexión a MongoDB (versión mejorada con opciones)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API funcionando!');
});

// ===== RUTAS PRINCIPALES =====
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/tareas', require('./routes/tareaRoutes'));
app.use('/api/recordatorios', require('./routes/recordatorioRoutes'));

module.exports = app;