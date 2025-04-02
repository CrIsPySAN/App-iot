// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  recoverPassword,
} = require('../controllers/auth.controller');

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para recuperar contraseña
router.post('/recover-password', recoverPassword);

// Ruta para cerrar sesión
router.post('/logout', logoutUser);

module.exports = router;
