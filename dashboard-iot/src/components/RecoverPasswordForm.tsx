"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Mail, ArrowLeft, Loader, Leaf, Sun, Droplets, Thermometer, CheckCircle, AlertCircle, X } from "lucide-react"

// Tipo para las alertas
type AlertType = "success" | "error" | "warning" | "info"

// Interfaz para las alertas
interface Alert {
    id: string
    type: AlertType
    title: string
    message: string
    exiting?: boolean
}

const RecoverPasswordForm: React.FC = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeIcon, setActiveIcon] = useState(0)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [emailSent, setEmailSent] = useState(false)

    // Rotate through icons for animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIcon((prev) => (prev + 1) % 4)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    // Función para mostrar alertas
    const showAlert = (type: AlertType, title: string, message: string) => {
        const id = Date.now().toString()
        setAlerts((prev) => [...prev, { id, type, title, message }])

        // Eliminar la alerta después de 5 segundos
        setTimeout(() => {
            removeAlert(id)
        }, 5000)
    }

    // Función para eliminar alertas
    const removeAlert = (id: string) => {
        // Primero añadimos la clase de salida para la animación
        setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, exiting: true } : alert)))

        // Después de la animación, eliminamos la alerta
        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id))
        }, 300)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await axios.post("http://localhost:4000/auth/recover-password", {
                email,
            })

            if (response.status === 200) {
                showAlert("success", "Correo enviado", "Se ha enviado un enlace de recuperación a tu correo electrónico.")
                setEmailSent(true)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Error al enviar el correo de recuperación."
            showAlert("error", "Error", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = () => {
        switch (activeIcon) {
            case 0:
                return <Leaf className="animate-icon" size={32} />
            case 1:
                return <Sun className="animate-icon" size={32} />
            case 2:
                return <Droplets className="animate-icon" size={32} />
            case 3:
                return <Thermometer className="animate-icon" size={32} />
            default:
                return <Leaf className="animate-icon" size={32} />
        }
    }

    // Función para renderizar el icono de la alerta según su tipo
    const getAlertIcon = (type: AlertType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="alert-icon" size={20} />
            case "error":
                return <AlertCircle className="alert-icon" size={20} />
            case "warning":
                return <AlertCircle className="alert-icon" size={20} />
            case "info":
                return <AlertCircle className="alert-icon" size={20} />
            default:
                return <AlertCircle className="alert-icon" size={20} />
        }
    }

    return (
        <div
            className="auth-container"
            style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)" }}
        >
            {/* Contenedor de alertas */}
            <div className="alerts-container">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`alert alert-${alert.type} ${alert.exiting ? "alert-exit" : ""}`}>
                        {getAlertIcon(alert.type)}
                        <div className="alert-content">
                            <div className="alert-title">{alert.title}</div>
                            <div className="alert-message">{alert.message}</div>
                        </div>
                        <button className="alert-close" onClick={() => removeAlert(alert.id)} aria-label="Cerrar alerta">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="login-card">
                <div className="login-sidebar">
                    <div className="login-sidebar-content">
                        <div className="login-logo">
                            <div className="login-logo-icon">{getIcon()}</div>
                            <h1 className="login-logo-text">Dashboard IoT</h1>
                        </div>

                        <div className="login-features">
                            <div className="login-feature">
                                <div className="feature-icon temperature">
                                    <Thermometer size={20} />
                                </div>
                                <span>Monitoreo de temperatura</span>
                            </div>
                            <div className="login-feature">
                                <div className="feature-icon humidity">
                                    <Droplets size={20} />
                                </div>
                                <span>Control de humedad</span>
                            </div>
                            <div className="login-feature">
                                <div className="feature-icon sun">
                                    <Sun size={20} />
                                </div>
                                <span>Seguimiento solar</span>
                            </div>
                        </div>

                        <div className="login-quote">
                            <blockquote>"Recupera el acceso a tu cuenta de forma segura"</blockquote>
                            <cite>— Dashboard IoT</cite>
                        </div>
                    </div>
                </div>

                <div className="login-form-container">
                    <div className="login-form-header">
                        <div className="login-welcome">
                            <h2>Recuperar contraseña</h2>
                            <p>Ingresa tu correo electrónico para recibir un enlace de recuperación</p>
                        </div>
                    </div>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="login-form-content">
                            <div className="form-group">
                                <label htmlFor="email">Correo electrónico</label>
                                <div className="input-container">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? <Loader className="spinner" size={20} /> : <>Enviar correo de recuperación</>}
                            </button>
                        </form>
                    ) : (
                        <div className="login-form-content">
                            <div className="recovery-success">
                                <CheckCircle size={48} className="success-icon" color="#10b981" />
                                <h3>Correo enviado</h3>
                                <p>
                                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor, revisa tu bandeja de
                                    entrada y sigue las instrucciones.
                                </p>
                            </div>
                            <button onClick={() => navigate("/login")} className="login-button" style={{ marginTop: "2rem" }}>
                                <ArrowLeft size={18} />
                                Volver al inicio de sesión
                            </button>
                        </div>
                    )}

                    <div className="login-footer">
                        <p>¿Recordaste tu contraseña?</p>
                        <a href="/login" className="register-link">
                            Iniciar sesión
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecoverPasswordForm

