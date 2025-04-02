"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import MapComponent from "./MapComponent"
import { ThermometerIcon as ThermostatIcon, Droplets, CloudRain, Sun, Clock, RefreshCw } from "lucide-react"


interface GlobalData {
    temperatura: number
    humedad: number
    lluvia: number
    sol: number
    nextUpdate?: number
    timeRemaining?: number
}

const Dashboard: React.FC = () => {
    const [globalData, setGlobalData] = useState<GlobalData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [timeRemaining, setTimeRemaining] = useState<number>(300) // 5 minutos por defecto
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
    const mapComponentRef = useRef<HTMLDivElement>(null)
    const [mapKey, setMapKey] = useState<number>(0)

    // Función para formatear el tiempo restante en formato mm:ss
    const formatTimeRemaining = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    // Función para obtener información sobre la próxima actualización
    const fetchUpdateInfo = useCallback(() => {
        fetch("http://localhost:5000/api/sensors/next-update")
            .then((res) => res.json())
            .then((data) => {
                if (data.timeRemaining) {
                    setTimeRemaining(data.timeRemaining)

                    // Guardar en localStorage para persistencia entre recargas
                    localStorage.setItem("nextApiUpdate", data.nextUpdate.toString())
                    localStorage.setItem("apiTimeRemaining", data.timeRemaining.toString())
                }
            })
            .catch((err) => {
                console.error("Error al obtener información de actualización:", err)
                // Si hay un error, seguimos usando el tiempo restante actual
            })
    }, [])

    // Función para obtener datos globales
    const fetchGlobalData = useCallback(() => {
        setLoading(true)
        fetch("http://localhost:5000/api/sensors/global-latest")
            .then((res) => res.json())
            .then((data) => {
                console.log("Datos globales recibidos:", data)
                setGlobalData(data)
                setLoading(false)

                // Si la API devuelve información de actualización, usarla
                if (data.timeRemaining) {
                    setTimeRemaining(data.timeRemaining)

                    // Guardar en localStorage para persistencia entre recargas
                    if (data.nextUpdate) {
                        localStorage.setItem("nextApiUpdate", data.nextUpdate.toString())
                        localStorage.setItem("apiTimeRemaining", data.timeRemaining.toString())
                    }
                }
            })
            .catch((err) => {
                console.error("Error al obtener datos globales:", err)
                setLoading(false)
            })
    }, [])

    // Función para actualizar todos los datos
    const refreshAllData = useCallback(() => {
        // Actualizar los datos globales
        fetchGlobalData()

        // Forzar la recarga del componente del mapa cambiando su key
        setMapKey((prev) => prev + 1)
    }, [fetchGlobalData])

    // Efecto para cargar datos iniciales y configurar el temporizador
    useEffect(() => {
        // Intentar recuperar información de actualización del servidor
        fetchUpdateInfo()

        // Cargar datos globales
        fetchGlobalData()

        // Intentar recuperar información de actualización del localStorage
        const savedNextUpdate = localStorage.getItem("nextApiUpdate")
        const savedTimeRemaining = localStorage.getItem("apiTimeRemaining")

        if (savedNextUpdate && savedTimeRemaining) {
            const nextUpdate = Number.parseInt(savedNextUpdate)
            const storedTimeRemaining = Number.parseInt(savedTimeRemaining)

            // Calcular el tiempo restante actual basado en el tiempo transcurrido
            const now = Date.now()
            if (nextUpdate > now) {
                const currentTimeRemaining = Math.ceil((nextUpdate - now) / 1000)
                setTimeRemaining(currentTimeRemaining)
            } else {
                // Si ya pasó el tiempo de actualización, usar el valor almacenado
                // (probablemente la API se actualizará pronto)
                setTimeRemaining(storedTimeRemaining)
            }
        }
    }, [fetchGlobalData, fetchUpdateInfo])

    // Efecto para el temporizador de cuenta regresiva
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prevTime) => {
                if (prevTime <= 1) {
                    // Cuando llega a cero, actualizar todos los datos y forzar la recarga del mapa
                    refreshAllData()

                    // También obtener nueva información de actualización
                    fetchUpdateInfo()

                    return 300 // Valor por defecto hasta que obtengamos la respuesta real
                }
                return prevTime - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [fetchUpdateInfo, refreshAllData])

    // Función para actualizar manualmente
    const handleManualRefresh = () => {
        if (!isRefreshing) {
            setIsRefreshing(true)
            refreshAllData()
            setTimeout(() => {
                setIsRefreshing(false)
            }, 1000)
        }
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Panel de Control</h2>
                <div className="dashboard-info">
                    <span className="dashboard-date">
                        {new Date().toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                    <div className="dashboard-timer" title="Tiempo para la próxima actualización de datos">
                        <div className="timer-content">
                            <Clock size={14} className="timer-icon" />
                            <span className="timer-text">Actualización en: {formatTimeRemaining(timeRemaining)}</span>
                        </div>
                        {/*<button
                            className={`refresh-now-btn ${isRefreshing ? "refreshing" : ""}`}
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            title="Actualizar ahora"
                        >
                            <RefreshCw size={14} className="refresh-icon" />
                        </button>*/}
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="map-container">
                    <div className="map-header">
                        <h3>Mapa de Parcelas</h3>
                        <span className="map-subtitle">Vista satelital</span>
                    </div>
                    <div className="map-wrapper" ref={mapComponentRef}>
                        {/* Usar key para forzar la recarga del componente cuando mapKey cambia */}
                        <MapComponent key={mapKey} />
                    </div>
                </div>

                <div className="stats-container">
                    <div className="stats-header">
                        <h3>Estadísticas Actuales</h3>
                        <span className="stats-subtitle">Datos en tiempo real</span>
                    </div>

                    <div className="stats-grid">
                        <div className={`stat-card ${loading ? "loading" : ""}`}>
                            <div className="stat-icon temperature">
                                <ThermostatIcon size={24} />
                            </div>
                            <div className="stat-info">
                                <h4>Temperatura</h4>
                                <div className="stat-value">{globalData ? `${globalData.temperatura}°C` : "Cargando..."}</div>
                            </div>
                        </div>

                        <div className={`stat-card ${loading ? "loading" : ""}`}>
                            <div className="stat-icon humidity">
                                <Droplets size={24} />
                            </div>
                            <div className="stat-info">
                                <h4>Humedad</h4>
                                <div className="stat-value">{globalData ? `${globalData.humedad}%` : "Cargando..."}</div>
                            </div>
                        </div>

                        <div className={`stat-card ${loading ? "loading" : ""}`}>
                            <div className="stat-icon rain">
                                <CloudRain size={24} />
                            </div>
                            <div className="stat-info">
                                <h4>Precipitación</h4>
                                <div className="stat-value">{globalData ? `${globalData.lluvia} mm` : "Cargando..."}</div>
                            </div>
                        </div>

                        <div className={`stat-card ${loading ? "loading" : ""}`}>
                            <div className="stat-icon sun">
                                <Sun size={24} />
                            </div>
                            <div className="stat-info">
                                <h4>Intensidad Solar</h4>
                                <div className="stat-value">{globalData ? `${globalData.sol}%` : "Cargando..."}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard