require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sensorRoutes = require('./routes/sensor.routes');
const { fetchAndStoreSensorData } = require('./services/iotService');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/sensors', sensorRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

setInterval(() => {
  fetchAndStoreSensorData();
}, 300_000);