"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Leaf } from "lucide-react"

interface LoadingScreenProps {
    message?: string
    subMessage?: string
    onComplete?: () => void
    duration?: number
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = "Iniciando sesión",
    subMessage = "Preparando tu dashboard",
    onComplete,
    duration = 2000,
}) => {
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        // Iniciar la animación de desvanecimiento después del tiempo especificado
        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, duration - 300) // 300ms antes para que la animación termine justo cuando se complete

        // Llamar a onComplete después de la duración especificada
        const completeTimer = setTimeout(() => {
            if (onComplete) onComplete()
        }, duration)

        // Limpiar los temporizadores al desmontar
        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(completeTimer)
        }
    }, [duration, onComplete])

    return (
        <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
            <div className="loading-screen-logo">
                <Leaf size={48} />
            </div>
            <div className="loading-screen-spinner">
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div className="loading-screen-text">{message}</div>
            <div className="loading-screen-subtext">{subMessage}</div>
        </div>
    )
}

export default LoadingScreen

