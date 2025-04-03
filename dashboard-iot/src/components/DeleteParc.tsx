"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
    Loader2,
    AlertCircle,
    Trash2,
    MapPin,
    Calendar,
    TreesIcon as Plant,
    RefreshCw,
    Droplets,
    ThermometerIcon,
    CloudRain,
    Sun,
} from "lucide-react"

interface Parcela {
    id: number
    nombre?: string
    parcela_nombre?: string // Algunos datos pueden venir con este nombre
    ubicacion?: string
    responsable?: string
    tipo_cultivo: string
    ultimo_riego?: string
    latitud: number | string
    longitud: number | string
    estado: boolean
}

const DeleteParc: React.FC = () => {
    const [deletedParcels, setDeletedParcels] = useState<Parcela[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDeletedParcels = () => {
        setLoading(true)
        setError(null)

        fetch("http://localhost:5000/api/sensors/deleted")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error en la respuesta del servidor")
                }
                return res.json()
            })
            .then((data) => {
                console.log("Parcelas inactivas:", data)
                setDeletedParcels(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error al obtener parcelas eliminadas:", err)
                setError("No se pudieron cargar las parcelas eliminadas. Por favor, intenta de nuevo.")
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchDeletedParcels()
    }, [])

    const formatDate = (dateString: string) => {
        if (!dateString) return "No disponible"

        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (e) {
            return dateString
        }
    }

    // Función para formatear coordenadas de manera segura
    const formatCoord = (coord: number | string) => {
        if (typeof coord === "number") {
            return coord.toFixed(4)
        } else if (typeof coord === "string") {
            const num = Number.parseFloat(coord)
            return isNaN(num) ? coord : num.toFixed(4)
        }
        return "N/A"
    }

    if (loading) {
        return (
            <div className="deleted-parcels-loading">
                <Loader2 className="spin-icon" size={36} />
                <p>Cargando parcelas eliminadas...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="deleted-parcels-error">
                <AlertCircle size={36} />
                <p>{error}</p>
                <button onClick={fetchDeletedParcels} className="refresh-button">
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        )
    }

    if (deletedParcels.length === 0) {
        return (
            <div className="deleted-parcels-empty">
                <Trash2 size={48} />
                <p>No hay parcelas eliminadas en el sistema.</p>
            </div>
        )
    }

    return (
        <div className="deleted-parcels-grid">
            {deletedParcels.map((parcela) => (
                <div key={parcela.id} className="deleted-parcel-card">
                    <div className="deleted-parcel-header">
                        <div className="deleted-parcel-id">#{parcela.id}</div>
                        <h3 className="deleted-parcel-name">
                            {parcela.parcela_nombre || parcela.nombre || `Parcela ${parcela.id}`}
                        </h3>
                    </div>

                    <div className="deleted-parcel-content">
                        <div className="deleted-parcel-info">
                            <Plant size={18} />
                            <span>
                                <strong>Cultivo:</strong> {parcela.tipo_cultivo || "No especificado"}
                            </span>
                        </div>

                        <div className="deleted-parcel-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>
                                <strong>Responsable:</strong> {parcela.responsable || "No especificado"}
                            </span>
                        </div>

                        {parcela.ultimo_riego && (
                            <div className="deleted-parcel-info">
                                <Calendar size={18} />
                                <span>
                                    <strong>Último riego:</strong> {formatDate(parcela.ultimo_riego)}
                                </span>
                            </div>
                        )}

                        <div className="deleted-parcel-info">
                            <MapPin size={18} />
                            <span>
                                <strong>Ubicación:</strong> {parcela.ubicacion || "No disponible"}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default DeleteParc

