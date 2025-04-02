require("dotenv").config()
const axios = require("axios")
const pool = require("../config/db")

// Variable para almacenar la información de la próxima actualización
const nextUpdateInfo = {
  lastUpdate: Date.now(),
  nextUpdate: Date.now() + 300000, // Por defecto, 5 minutos después
  timeRemaining: 300, // 5 minutos en segundos
}

// Función para actualizar la información de la próxima actualización
function updateNextUpdateInfo() {
  const now = Date.now()
  nextUpdateInfo.lastUpdate = now

  // Obtener el intervalo de actualización desde las variables de entorno o usar 5 minutos por defecto
  const updateIntervalMinutes = Number.parseInt(process.env.UPDATE_INTERVAL_MINUTES || "5", 10)
  const updateIntervalMs = updateIntervalMinutes * 60 * 1000

  nextUpdateInfo.nextUpdate = now + updateIntervalMs
  nextUpdateInfo.timeRemaining = updateIntervalMinutes * 60
}

// Función para obtener información sobre la próxima actualización
function getNextUpdateTime() {
  const now = Date.now()
  const timeRemainingMs = Math.max(0, nextUpdateInfo.nextUpdate - now)
  const timeRemainingSec = Math.ceil(timeRemainingMs / 1000)

  return {
    lastUpdate: nextUpdateInfo.lastUpdate,
    nextUpdate: nextUpdateInfo.nextUpdate,
    timeRemaining: timeRemainingSec,
  }
}

/**
 * Llama a la API externa y guarda/actualiza los datos en la BD
 */
async function fetchAndStoreSensorData() {
  try {
    const url = process.env.EXTERNAL_API_URL || "https://moriahmkt.com/iotapp/test/"
    const response = await axios.get(url)

    // Estructura esperada del JSON:
    // {
    //   "sensores": {...},
    //   "parcelas": [ { "id": 1, "nombre": "...", "sensor": {...} }, ... ]
    // }

    const { sensores, parcelas } = response.data

    // 1. Guardar datos "globales" en la tabla "sensores_globales" (opcional)
    if (sensores) {
      const { humedad, temperatura, lluvia, sol } = sensores
      const globalQuery = `
        INSERT INTO sensores_globales (humedad, temperatura, lluvia, sol)
        VALUES (?, ?, ?, ?)
      `
      await pool.execute(globalQuery, [humedad, temperatura, lluvia, sol])
      console.log('Datos globales guardados en "sensores_globales".')
    }

    // 2. Procesar cada "parcela" y su sensor asociado
    if (parcelas && Array.isArray(parcelas)) {
      // PASO A: Obtener todos los IDs que vienen en la API (parcelas activas)
      const apiParcelIDs = parcelas.map((p) => p.id)

      // Bucle para insertar/actualizar parcelas con estado=1
      for (const parcela of parcelas) {
        const { id, nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud, sensor } = parcela

        // A) Insertar/actualizar la info de la parcela con estado=1 (activa)
        const parcelaQuery = `
          INSERT INTO parcelas (id, nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            nombre = VALUES(nombre),
            ubicacion = VALUES(ubicacion),
            responsable = VALUES(responsable),
            tipo_cultivo = VALUES(tipo_cultivo),
            ultimo_riego = VALUES(ultimo_riego),
            latitud = VALUES(latitud),
            longitud = VALUES(longitud),
            estado = VALUES(estado)
        `
        await pool.execute(parcelaQuery, [
          id,
          nombre,
          ubicacion || "",
          responsable || "",
          tipo_cultivo,
          ultimo_riego,
          latitud,
          longitud,
          true, // estado => 1 (activa)
        ])

        // B) Insertar una nueva lectura en 'datos_sensores'
        if (sensor) {
          const { humedad, temperatura, lluvia, sol } = sensor

          const sensorQuery = `
            INSERT INTO datos_sensores (parcela_id, humedad, temperatura, lluvia, sol)
            VALUES (?, ?, ?, ?, ?)
          `
          await pool.execute(sensorQuery, [
            id, // parcela_id
            humedad, // humedad
            temperatura, // temperatura
            lluvia, // lluvia de cada parcela
            sol, // sol
          ])
        }
      }
      console.log("Datos de parcelas y sensores guardados/actualizados.")

      // PASO B: Marcar como inactivas (estado=0) las que NO están en apiParcelIDs
      if (apiParcelIDs.length > 0) {
        // Construimos un IN (...) dinámico
        const placeholders = apiParcelIDs.map(() => "?").join(", ")
        const inQuery = `(${placeholders})`

        const deactivateQuery = `
          UPDATE parcelas
          SET estado = 0
          WHERE id NOT IN ${inQuery}
        `
        await pool.execute(deactivateQuery, apiParcelIDs)
        console.log("Parcelas que no están en la API han sido marcadas como inactivas (estado=0).")
      } else {
        // Si la API no devolvió ninguna parcela, marcamos todas como inactivas
        await pool.execute("UPDATE parcelas SET estado = 0")
        console.log("No se devolvieron parcelas en la API. Todas se marcaron inactivas.")
      }
    }

    // Actualizar la información de la próxima actualización
    updateNextUpdateInfo()
  } catch (error) {
    console.error("Error al obtener o guardar datos:", error.message)
  }
}

/**
 * Retorna los datos de la BD (últimos N registros).
 * @param {number} limit - Número de registros a devolver (opcional).
 */
async function getSensorData(limit = 50) {
  // Construimos la consulta con un limit fijo o dinámico
  const query = `
    SELECT ds.id, ds.parcela_id, ds.humedad, ds.temperatura, ds.lluvia, ds.sol, ds.created_at,
           p.nombre AS parcela_nombre, p.tipo_cultivo, p.estado
    FROM datos_sensores ds
    LEFT JOIN parcelas p ON ds.parcela_id = p.id
    ORDER BY ds.created_at DESC
    LIMIT ${limit}
  `
  const [rows] = await pool.query(query)
  return rows
}

// Inicializar la información de la próxima actualización
updateNextUpdateInfo()

module.exports = {
  fetchAndStoreSensorData,
  getSensorData,
  getNextUpdateTime,
}

