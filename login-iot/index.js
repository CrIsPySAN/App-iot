require('dotenv').config();
const express = require('express');
const cors = require('cors');  // Importamos cors
const app = express();
const authRoutes = require('./src/routes/auth.routes');

const PORT = process.env.PORT || 4000;  // Aseguramos que el servidor escuche en el puerto 4000

// Configuración de CORS
app.use(
  cors({
    origin: 'http://localhost:3000',  // Permitir solicitudes solo desde el frontend en localhost:3000
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// Middleware para parsear JSON
app.use(express.json());

// Rutas de autenticación
app.use('/auth', authRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
