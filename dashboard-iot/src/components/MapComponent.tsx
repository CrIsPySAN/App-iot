"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Loader2 } from "lucide-react"

mapboxgl.accessToken =
    process.env.REACT_APP_MAPBOX_TOKEN ||
    "pk.eyJ1IjoiZGllZ29nMCIsImEiOiJjbTg3ZWk3ZGwwNGtsMmpxN25vbTlicWpjIn0.PJ7MoQalUbofWzmkDefPrg"

const initialCenter = { lat: 21.0486, lng: -86.8467 }

const MapComponent: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const markersRef = useRef<mapboxgl.Marker[]>([])
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    // Función para limpiar los marcadores existentes de forma segura
    const clearMarkers = () => {
        if (markersRef.current && markersRef.current.length > 0) {
            markersRef.current.forEach((marker) => {
                try {
                    marker.remove()
                } catch (e) {
                    console.warn("Error al eliminar marcador:", e)
                }
            })
            markersRef.current = []
        }
    }

    // Función para limpiar todos los recursos del mapa de forma segura
    const cleanupMap = () => {
        // Primero limpiar los marcadores
        clearMarkers()

        // Luego desconectar el ResizeObserver si existe
        if (resizeObserverRef.current) {
            try {
                resizeObserverRef.current.disconnect()
                resizeObserverRef.current = null
            } catch (e) {
                console.warn("Error al desconectar ResizeObserver:", e)
            }
        }

        // Finalmente eliminar el mapa si existe
        if (mapRef.current) {
            try {
                mapRef.current.remove()
                mapRef.current = null
            } catch (e) {
                console.warn("Error al eliminar el mapa:", e)
            }
        }
    }

    useEffect(() => {
        if (!mapContainerRef.current) return

        // Limpiar recursos anteriores si existen
        cleanupMap()

        // Crear nuevo mapa
        try {
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/satellite-streets-v12",
                center: [initialCenter.lng, initialCenter.lat],
                zoom: 15,
            })

            mapRef.current = map

            map.addControl(new mapboxgl.NavigationControl(), "top-left")
            map.addControl(new mapboxgl.ScaleControl(), "bottom-left")

            // Crear nuevo ResizeObserver
            const resizeObserver = new ResizeObserver(() => {
                if (mapRef.current) {
                    mapRef.current.resize()
                }
            })

            if (mapContainerRef.current) {
                resizeObserver.observe(mapContainerRef.current)
                resizeObserverRef.current = resizeObserver
            }

            map.on("load", () => {
                setLoading(false)

                fetch("http://localhost:5000/api/sensors?limit=50")
                    .then((res) => res.json())
                    .then((data) => {
                        const activeParcels = data.filter((p: any) => p.estado === 1)

                        if (activeParcels.length === 0) {
                            console.log("No hay parcelas vigentes")
                            return
                        }

                        const bounds = new mapboxgl.LngLatBounds()

                        activeParcels.forEach((parcela: any) => {
                            const lng = Number(parcela.longitud)
                            const lat = Number(parcela.latitud)

                            if (isNaN(lng) || isNaN(lat)) {
                                console.warn(`Coordenadas inválidas para parcela ID ${parcela.id}`)
                                return
                            }

                            // Crear un elemento personalizado para el marcador
                            const el = document.createElement("div")
                            el.className = "custom-marker"
                            el.innerHTML = `<div class="marker-pin"></div>`

                            // Añadir un atributo de datos para identificar el tipo de cultivo
                            el.setAttribute("data-cultivo", parcela.tipo_cultivo || "desconocido")

                            // Añadir un tooltip al marcador
                            el.setAttribute("title", parcela.parcela_nombre || `Parcela #${parcela.id}`)

                            const marker = new mapboxgl.Marker(el)
                                .setLngLat([lng, lat])
                                .setPopup(
                                    new mapboxgl.Popup({ className: "custom-popup", maxWidth: "320px" }).setHTML(`
                                  <div class="popup-content">
                                      <div class="popup-header">
                                          <h3 class="popup-title">${parcela.parcela_nombre || `Parcela #${parcela.id}`}</h3>
                                          <span class="popup-status ${parcela.estado ? "status-active" : "status-inactive"}">
                                              ${parcela.estado ? "Activa" : "Inactiva"}
                                          </span>
                                      </div>
                                      
                                      <div class="popup-body">
                                          <div class="popup-section">
                                              <div class="popup-cultivo">
                                                  <span class="popup-cultivo-icon">🌱</span>
                                                  <span class="popup-cultivo-text">${parcela.tipo_cultivo || "Tipo no especificado"}</span>
                                              </div>
                                          </div>
                                          
                                          <div class="popup-section">
                                              <div class="popup-responsable">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                  <span class="popup-responsable-text">
                                                      <strong>Responsable:</strong> ${parcela.responsable || "No asignado"}
                                                  </span>
                                              </div>
                                          </div>
                                          
                                          <div class="popup-section">
                                              <div class="popup-responsable">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                  <span class="popup-responsable-text">
                                                      <strong>Ubicación:</strong> ${parcela.ubicacion || "No especificada"}
                                                  </span>
                                              </div>
                                          </div>
                                          
                                          <div class="popup-section">
                                              <div class="popup-metrics-grid">
                                                  <div class="popup-metric">
                                                      <div class="popup-metric-icon temp-icon">
                                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>
                                                      </div>
                                                      <div class="popup-metric-data">
                                                          <span class="popup-metric-value">${parcela.temperatura}°C</span>
                                                          <span class="popup-metric-label">Temperatura</span>
                                                      </div>
                                                  </div>
                                                  
                                                  <div class="popup-metric">
                                                      <div class="popup-metric-icon humidity-icon">
                                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path></svg>
                                                      </div>
                                                      <div class="popup-metric-data">
                                                          <span class="popup-metric-value">${parcela.humedad}%</span>
                                                          <span class="popup-metric-label">Humedad</span>
                                                      </div>
                                                  </div>
                                                  
                                                  <div class="popup-metric">
                                                      <div class="popup-metric-icon rain-icon">
                                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>
                                                      </div>
                                                      <div class="popup-metric-data">
                                                          <span class="popup-metric-value">${parcela.lluvia}mm</span>
                                                          <span class="popup-metric-label">Lluvia</span>
                                                      </div>
                                                  </div>
                                                  
                                                  <div class="popup-metric">
                                                      <div class="popup-metric-icon sun-icon">
                                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                                                      </div>
                                                      <div class="popup-metric-data">
                                                          <span class="popup-metric-value">${parcela.sol}%</span>
                                                          <span class="popup-metric-label">Sol</span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          
                                          <div class="popup-section">
                                              <div class="popup-location">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                  <span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  `),
                                )
                                .addTo(map)

                            // Guardar referencia al marcador para poder eliminarlo después
                            markersRef.current.push(marker)

                            bounds.extend([lng, lat])
                        })

                        if (bounds.isEmpty()) {
                            // Si no hay coordenadas válidas, usar el centro inicial
                            map.setCenter([initialCenter.lng, initialCenter.lat])
                        } else {
                            // Ajustar el mapa para mostrar todos los marcadores
                            map.fitBounds(bounds, { padding: 50 })
                        }
                    })
                    .catch((err) => {
                        console.error("Error al obtener parcelas activas:", err)
                        setError("No se pudieron cargar las parcelas")
                    })
            })
        } catch (err) {
            console.error("Error al inicializar el mapa:", err)
            setError("No se pudo inicializar el mapa")
        }

        // Limpiar recursos al desmontar el componente
        return () => {
            cleanupMap()
        }
    }, []) // El efecto se ejecuta solo al montar el componente

    return (
        <div className="map-component">
            {loading && (
                <div className="map-loading">
                    <Loader2 className="spin-icon" size={24} />
                    <span>Cargando mapa...</span>
                </div>
            )}

            {error && (
                <div className="map-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            )}

            <div ref={mapContainerRef} className="map-container" />
        </div>
    )
}

export default MapComponent