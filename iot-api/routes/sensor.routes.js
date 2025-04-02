const express = require("express")
const router = express.Router()
const { getSensorData, getNextUpdateTime } = require("../services/iotService")
const pool = require("../config/db")

router.get("/", async (req, res) => {
  try {
    let limit = Number.parseInt(req.query.limit, 10)
    if (isNaN(limit) || limit <= 0) {
      limit = 50
    }

    const query = `
      SELECT ds.id,
             ds.parcela_id,
             ds.humedad,
             ds.temperatura,
             ds.lluvia,
             ds.sol,
             ds.created_at,
             p.nombre AS parcela_nombre,
             p.ubicacion,
             p.responsable,
             p.tipo_cultivo,
             p.estado,
             p.latitud,        -- Agregamos latitud
             p.longitud        -- Agregamos longitud
      FROM datos_sensores ds
      LEFT JOIN parcelas p ON ds.parcela_id = p.id
      ORDER BY ds.created_at DESC
      LIMIT ${limit}
    `

    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/latest", async (req, res) => {
  try {
    const data = await getSensorData(1)
    return res.json(data[0] || {})
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

router.get("/global-latest", async (req, res) => {
  try {
    const query = `
      SELECT humedad, temperatura, lluvia, sol, created_at
      FROM sensores_globales
      ORDER BY created_at DESC
      LIMIT 1
    `
    const [rows] = await pool.query(query)

    // Obtener información sobre la próxima actualización
    const updateInfo = getNextUpdateTime()

    if (rows.length > 0) {
      // Agregar información de actualización a la respuesta
      const response = {
        ...rows[0],
        nextUpdate: updateInfo.nextUpdate,
        timeRemaining: updateInfo.timeRemaining,
      }
      res.json(response)
    } else {
      res.json({
        humedad: 0,
        temperatura: 0,
        lluvia: 0,
        sol: 0,
        nextUpdate: updateInfo.nextUpdate,
        timeRemaining: updateInfo.timeRemaining,
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/deleted", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM parcelas
      WHERE estado = 0
    `)
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// Nuevo endpoint para obtener información sobre la próxima actualización
router.get("/next-update", (req, res) => {
  try {
    const updateInfo = getNextUpdateTime()
    res.json(updateInfo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

