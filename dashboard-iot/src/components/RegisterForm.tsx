"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
    Mail,
    Lock,
    ArrowRight,
    Loader,
    User,
    Leaf,
    Sun,
    Droplets,
    Thermometer,
    Check,
    CheckCircle,
    AlertCircle,
    XCircle,
    Info,
    X,
    Eye,
    EyeOff,
} from "lucide-react"

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

const RegisterForm: React.FC = () => {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeIcon, setActiveIcon] = useState(0)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [showPassword, setShowPassword] = useState(false)

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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validación de contraseña
        if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
            showAlert(
                "warning",
                "Contraseña débil",
                "Por favor, asegúrate de cumplir con todos los requisitos de seguridad para la contraseña.",
            )

            // Marcar el campo de contraseña con error
            document.getElementById("password")?.classList.add("input-error")

            // Quitar la clase de error después de 3 segundos
            setTimeout(() => {
                document.getElementById("password")?.classList.remove("input-error")
            }, 3000)

            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await axios.post("http://localhost:4000/auth/register", {
                email,
                password,
                name,
            })

            if (response.status === 201) {
                // Mostrar alerta de éxito
                showAlert(
                    "success",
                    "¡Registro exitoso!",
                    "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
                )

                // Redirigir después de un breve retraso para que el usuario vea la alerta
                setTimeout(() => {
                    navigate("/login")
                }, 2000)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Error al registrar el usuario. Intenta nuevamente."
            setError(errorMessage)

            // Mostrar alerta de error
            if (errorMessage.includes("already registered")) {
                // Añadir clase de error al input de email
                document.getElementById("email")?.classList.add("input-error")

                // Quitar la clase de error después de 3 segundos
                setTimeout(() => {
                    document.getElementById("email")?.classList.remove("input-error")
                }, 3000)

                showAlert(
                    "error",
                    "Error de registro",
                    "Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.",
                )
            } else {
                showAlert("error", "Error de registro", errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    // Get the current icon based on activeIcon state
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

    // Password strength validation
    const hasMinLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    // Función para renderizar el icono de la alerta según su tipo
    const getAlertIcon = (type: AlertType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="alert-icon" size={20} />
            case "error":
                return <XCircle className="alert-icon" size={20} />
            case "warning":
                return <AlertCircle className="alert-icon" size={20} />
            case "info":
                return <Info className="alert-icon" size={20} />
            default:
                return <Info className="alert-icon" size={20} />
        }
    }

    return (
        <div
            className="auth-container"
            style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)" }}
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
                            <blockquote>"Únete a la revolución de la agricultura inteligente"</blockquote>
                            <cite>— Dashboard IoT</cite>
                        </div>
                    </div>
                </div>

                <div className="login-form-container">
                    <div className="login-form-header">
                        <div className="login-welcome">
                            <h2>Crear cuenta</h2>
                            <p>Completa tus datos para registrarte</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form-content">
                        <div className="form-group">
                            <label htmlFor="name">Nombre completo</label>
                            <div className="input-container">
                                <User className="input-icon" size={18} />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Tu nombre completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

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

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="input-container">
                                <Lock className="input-icon" size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Crea una contraseña segura"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="password-toggle-btn" onClick={togglePasswordVisibility} tabIndex={-1}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {password && (
                                <div className="password-strength">
                                    <p className="strength-text">Tu contraseña debe tener:</p>
                                    <ul className="strength-list">
                                        <li className={hasMinLength ? "valid" : ""}>
                                            {hasMinLength ? <Check size={14} /> : <span>○</span>} Al menos 8 caracteres
                                        </li>
                                        <li className={hasUpperCase ? "valid" : ""}>
                                            {hasUpperCase ? <Check size={14} /> : <span>○</span>} Al menos una mayúscula
                                        </li>
                                        <li className={hasNumber ? "valid" : ""}>
                                            {hasNumber ? <Check size={14} /> : <span>○</span>} Al menos un número
                                        </li>
                                        <li className={hasSpecialChar ? "valid" : ""}>
                                            {hasSpecialChar ? <Check size={14} /> : <span>○</span>} Al menos un carácter especial
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="form-error-container">
                                <div className="form-error-icon">
                                    <AlertCircle size={18} />
                                </div>
                                <div className="form-error-message">{error}</div>
                            </div>
                        )}

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? (
                                <Loader className="spinner" size={20} />
                            ) : (
                                <>
                                    Crear cuenta
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>¿Ya tienes una cuenta?</p>
                        <a href="/login" className="register-link">
                            Iniciar sesión
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RegisterForm

