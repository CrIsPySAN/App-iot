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
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"

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
    const [timeRange, setTimeRange] = useState<number>(5) // Por defecto 5 registros

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

    const sortedData = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

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
                },
            },
        },
    }

    // Datos para la gráfica de temperatura y humedad
    const tempHumChartData = {
        labels: chartLabels,
        datasets: [
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
                        <option value="5">5 registros</option>
                        <option value="10">10 registros</option>
                        <option value="20">20 registros</option>
                        <option value="50">50 registros</option>
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
                        <span className="chart-subtitle">Últimas mediciones</span>
                    </div>
                    <div className="chart-body">
                        <Line data={tempHumChartData} options={commonOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Precipitación</h3>
                        <span className="chart-subtitle">Mediciones de lluvia</span>
                    </div>
                    <div className="chart-body">
                        <Bar data={rainChartData} options={commonOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Intensidad Solar</h3>
                        <span className="chart-subtitle">Niveles de radiación solar</span>
                    </div>
                    <div className="chart-body">
                        <Line data={sunChartData} options={commonOptions} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GraphicView

