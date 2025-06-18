const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <-- Única declaración necesaria

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña_hash: { type: String, required: true, select: false }
});

// Middleware para encriptar contraseña
UsuarioSchema.pre('save', async function(next) {
  if (this.isModified('contraseña_hash')) {
    this.contraseña_hash = await bcrypt.hash(this.contraseña_hash, 10);
  }
  next();
});

// Método para comparar contraseñas (usa el bcrypt ya declarado)
UsuarioSchema.methods.compararContraseña = async function(contraseña) {
  return await bcrypt.compare(contraseña, this.contraseña_hash);
};

// Método para limpiar el output
UsuarioSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.contraseña_hash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);