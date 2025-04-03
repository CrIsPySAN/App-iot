"use client"

import type React from "react"
import { useEffect } from "react"
import { LogOut } from "lucide-react"

interface LogoutModalProps {
    isOpen: boolean
    onClose: () => void
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            // Cerrar automáticamente después de 2 segundos
            const timer = setTimeout(() => {
                onClose()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className={`logout-overlay ${isOpen ? "active" : ""}`}>
            <div className="logout-modal">
                <div className="logout-icon">
                    <LogOut size={32} />
                </div>
                <h3 className="logout-title">Cerrando sesión</h3>
                <p className="logout-message">
                    <span className="logout-spinner"></span>
                    Finalizando tu sesión...
                </p>
            </div>
        </div>
    )
}

export default LogoutModal

