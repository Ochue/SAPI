const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// =============================================
// 1. Configuración avanzada de CORS
// =============================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend en 5173
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Para navegadores antiguos
};

app.use(cors(corsOptions));

// Middleware para logs de CORS (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[CORS] Origen permitido: ${req.get('origin')}`);
    next();
  });
}

// =============================================
// 2. Middlewares esenciales
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// 3. Conexión a MongoDB (con reconexión automática)
// =============================================
const mongooseOptions = {
  connectTimeoutMS: 30000, // 30 segundos de espera
  socketTimeoutMS: 45000   // 45 segundos de inactividad
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1); // Salir si no hay conexión
  });

// Eventos de conexión para manejar errores post-conexión
mongoose.connection.on('disconnected', () => 
  console.log('⚠️  MongoDB desconectado'));
mongoose.connection.on('reconnected', () => 
  console.log('🔁 MongoDB reconectado'));

// =============================================
// 4. Rutas principales
// =============================================
app.get('/', (req, res) => res.send('¡API funcionando!'));

// Rutas API
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tareas', require('./routes/tareaRoutes'));
app.use('/api/recordatorios', require('./routes/recordatorioRoutes'));
app.use('/api/equipos', require('./routes/equipoRoutes'));

// =============================================
// 5. Manejo de errores global
// =============================================
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});
//Hola//
module.exports = app;