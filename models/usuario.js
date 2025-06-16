const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña_hash: { type: String, required: true, select: false } // ¡Importante! select: false
});

// Encriptar contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (this.isModified('contraseña_hash')) {
    this.contraseña_hash = await bcrypt.hash(this.contraseña_hash, 10);
  }
  next();
});

// Método para omitir el hash al convertir a JSON
UsuarioSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.contraseña_hash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);