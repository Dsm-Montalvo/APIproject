const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, edad, sexo, email, password, preferences, plataforma } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !edad || !sexo || !email || !password || !preferences || !plataforma) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!Array.isArray(preferences.generos) || !Array.isArray(preferences.autores)) {
      return res.status(400).json({ message: 'Las preferencias deben contener listas válidas' });
    }

    if (typeof edad !== 'number' || edad < 13) {
      return res.status(400).json({ message: 'La edad debe ser mayor o igual a 13' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Correo electrónico no válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await Usuario.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      edad,
      sexo,
      email,
      password: hashedPassword,
      preferences,
      plataforma
    });

    await nuevoUsuario.save();

    res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ success: true, token, usuario });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;