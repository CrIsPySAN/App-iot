"use client"

import type React from "react"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale,
    RadarController,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { Loader2, AlertCircle, RefreshCw, Thermometer, Droplets, CloudRain, Sun } from "lucide-react"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale,
    RadarController,
)

interface SensorData {
    id: number
    parcela_id: number
    humedad: number
    temperatura: number
    lluvia: number
    sol: number
    created_at: string
    parcela_nombre: string
    tipo_cultivo: string
    estado: boolean
}

const GraphicView: React.FC = () => {
    const [data, setData] = useState<SensorData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState<number>(7) // Por defecto 7 registros
    const [showTemperature, setShowTemperature] = useState<boolean>(true)
    const [showHumidity, setShowHumidity] = useState<boolean>(true)

    const fetchData = () => {
        setLoading(true)
        setError(null)

        fetch("http://localhost:5000/api/sensors?limit=100")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error en la respuesta del servidor")
                }
                return res.json()
            })
            .then((json) => {
                console.log("Datos recibidos:", json)
                setData(json)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error al obtener datos:", err)
                setError("No se pudieron cargar los datos. Por favor, intenta de nuevo.")
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="charts-loading">
                <Loader2 className="spin-icon" size={36} />
                <p>Cargando datos de sensores...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="charts-error">
                <AlertCircle size={36} />
                <p>{error}</p>
                <button onClick={fetchData} className="refresh-button">
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="charts-empty">
                <AlertCircle size={36} />
                <p>No hay datos disponibles para mostrar</p>
                <button onClick={fetchData} className="refresh-button">
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        )
    }

    // Ordenar datos por fecha (del más antiguo al más reciente)
    const sortedData = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Obtener los últimos 'timeRange' registros (por defecto 7)
    const lastRecords = sortedData.slice(-timeRange)

    const chartLabels = lastRecords.map((item) => dayjs(item.created_at).format("DD/MM HH:mm"))

    // Opciones comunes para todas las gráficas
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: {
                        family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        size: 12,
                    },
                    usePointStyle: true,
                    padding: 20,
                },
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#111827",
                bodyColor: "#111827",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                bodyFont: {
                    family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                },
                titleFont: {
                    family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                    weight: 700,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        size: 11,
                    },
                },
                title: {
                    display: true,
                    text: "Fecha y Hora",
                    font: {
                        family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        size: 12,
                        weight: "bold" as const,
                    },
                    padding: { top: 10, bottom: 0 },
                },
            },
            y: {
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                    font: {
                        family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        size: 11,
                    },
                    callback: (value: any) => {
                        return value // Valor base, se sobrescribe en cada gráfica
                    },
                },
                title: {
                    display: true,
                    text: "Valor", // Se sobrescribe en cada gráfica
                    font: {
                        family: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        size: 12,
                        weight: "bold" as const,
                    },
                    padding: { top: 0, bottom: 10 },
                },
            },
        },
    }

    // Opciones específicas para temperatura y humedad
    const tempHumOptions = {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    ...commonOptions.scales.y.title,
                    text:
                        showTemperature && showHumidity
                            ? "Temperatura (°C) / Humedad (%)"
                            : showTemperature
                                ? "Temperatura (°C)"
                                : "Humedad (%)",
                },
                ticks: {
                    ...commonOptions.scales.y.ticks,
                    callback: (value: any) => {
                        if (showTemperature && showHumidity) {
                            return value + (value <= 50 ? "°C" : "%")
                        } else if (showTemperature) {
                            return value + "°C"
                        } else {
                            return value + "%"
                        }
                    },
                },
            },
        },
    }

    // Opciones específicas para lluvia
    const rainOptions = {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    ...commonOptions.scales.y.title,
                    text: "Precipitación (mm)",
                },
                ticks: {
                    ...commonOptions.scales.y.ticks,
                    callback: (value: any) => value + " mm",
                },
            },
        },
    }

    // Opciones específicas para intensidad solar
    const sunOptions = {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    ...commonOptions.scales.y.title,
                    text: "Intensidad Solar (%)",
                },
                ticks: {
                    ...commonOptions.scales.y.ticks,
                    callback: (value: any) => value + "%",
                },
            },
        },
    }

    // Datos para la gráfica de temperatura y humedad
    const tempHumChartData = {
        labels: chartLabels,
        datasets: [
            ...(showTemperature
                ? [
                    {
                        label: "Temperatura (°C)",
                        data: lastRecords.map((item) => item.temperatura),
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        borderWidth: 2,
                        pointBackgroundColor: "#ef4444",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true,
                    },
                ]
                : []),
            ...(showHumidity
                ? [
                    {
                        label: "Humedad (%)",
                        data: lastRecords.map((item) => item.humedad),
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        borderWidth: 2,
                        pointBackgroundColor: "#3b82f6",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true,
                    },
                ]
                : []),
        ],
    }

    // Datos para la gráfica de lluvia
    const rainChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: "Lluvia (mm)",
                data: lastRecords.map((item) => item.lluvia),
                backgroundColor: "#8b5cf6",
                borderColor: "#7c3aed",
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: "#7c3aed",
            },
        ],
    }

    // Datos para la gráfica de intensidad del sol
    const sunChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: "Intensidad del Sol (%)",
                data: lastRecords.map((item) => item.sol),
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#f59e0b",
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true,
            },
        ],
    }

    return (
        <div className="charts-container">
            {/*<div className="charts-header">
                <h3>Análisis de Datos</h3>
                <div className="charts-controls">
                    <label htmlFor="timeRange">Mostrar últimos:</label>
                    <select
                        id="timeRange"
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        className="time-range-select"
                    >
                        <option value="7">7 registros</option>
                        <option value="14">14 registros</option>
                        <option value="30">30 registros</option>
                        <option value="60">60 registros</option>
                    </select>
                    <button onClick={fetchData} className="refresh-button">
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                </div>
            </div>*/}

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Temperatura y Humedad</h3>
                        <div className="chart-controls">
                            <span className="chart-subtitle">Últimas mediciones</span>
                            <div className="sensor-toggles">
                                <button
                                    className={`sensor-toggle ${showTemperature ? "active" : ""}`}
                                    onClick={() => setShowTemperature(!showTemperature)}
                                    title="Mostrar/ocultar temperatura"
                                >
                                    <Thermometer size={16} />
                                    <span>Temperatura</span>
                                </button>
                                <button
                                    className={`sensor-toggle ${showHumidity ? "active" : ""}`}
                                    onClick={() => setShowHumidity(!showHumidity)}
                                    title="Mostrar/ocultar humedad"
                                >
                                    <Droplets size={16} />
                                    <span>Humedad</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="chart-body">
                        {!showTemperature && !showHumidity ? (
                            <div className="chart-empty-message">
                                <p>Selecciona al menos un sensor para visualizar datos</p>
                            </div>
                        ) : (
                            <Line data={tempHumChartData} options={tempHumOptions} />
                        )}
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Precipitación</h3>
                        <div className="chart-controls">
                            <span className="chart-subtitle">Mediciones de lluvia</span>
                            <div className="sensor-info">
                                <CloudRain size={16} />
                                <span>mm</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-body">
                        <Bar data={rainChartData} options={rainOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Intensidad Solar</h3>
                        <div className="chart-controls">
                            <span className="chart-subtitle">Niveles de radiación solar</span>
                            <div className="sensor-info">
                                <Sun size={16} />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-body">
                        <Line data={sunChartData} options={sunOptions} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GraphicView
