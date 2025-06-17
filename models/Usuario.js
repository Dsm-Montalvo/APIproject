const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  edad: Number,
  sexo: String,
  email: { type: String, unique: true },
  password: String,
  preferences: {
    generos: [String],
    autores: [String]
  },
  plataforma: [String]
});

module.exports = mongoose.model('Usuario', usuarioSchema);