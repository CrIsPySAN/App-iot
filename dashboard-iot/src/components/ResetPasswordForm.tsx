"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { supabase } from "../services/SupabaseClient"
import {
    Lock,
    ArrowRight,
    Loader,
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

const parseHash = (hash: string) => {
    if (!hash || hash === "#") return new URLSearchParams()
    return new URLSearchParams(hash.replace("#", ""))
}

const ResetPasswordForm: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeIcon, setActiveIcon] = useState(0)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [token, setToken] = useState("")
    const [accessToken, setAccessToken] = useState("")

    // Referencia para almacenar el token original antes de que se pierda
    const initialUrlRef = useRef(window.location.href)
    const initialHashRef = useRef(window.location.hash)
    const initialSearchRef = useRef(window.location.search)

    // Extraer el token de la URL y configurar la sesión de Supabase
    useEffect(() => {
        // Intentar obtener el token del hash original (antes de que React Router lo modifique)
        const captureTokenFromInitialUrl = async () => {
            console.log("URL inicial:", initialUrlRef.current)
            console.log("Hash inicial:", initialHashRef.current)
            console.log("Search inicial:", initialSearchRef.current)

            // Intentar extraer el token del hash original
            let tokenFound = false

            // 1. Intentar obtener access_token del hash original
            const originalHash = initialHashRef.current
            if (originalHash && originalHash !== "#") {
                const hashParams = parseHash(originalHash)
                const access_token = hashParams.get("access_token")
                const refresh_token = hashParams.get("refresh_token") || ""
                const type = hashParams.get("type")

                if (access_token) {
                    console.log("Token encontrado en hash original:", access_token)
                    tokenFound = true
                    setAccessToken(access_token)

                    // Configurar sesión de Supabase
                    try {
                        const { error } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        })

                        if (error) {
                            console.error(error)
                            if (error.message.includes("expired") || error.message.includes("Invalid")) {
                                showAlert(
                                    "error",
                                    "Enlace expirado",
                                    "El enlace ha expirado o ya fue utilizado. Solicita uno nuevo para restablecer tu contraseña.",
                                )
                            } else {
                                showAlert("error", "Error de sesión", "Error al establecer sesión de recuperación: " + error.message)
                            }
                        } else {
                            console.log("Sesión de Supabase establecida correctamente")
                        }
                    } catch (err) {
                        console.error("Error al establecer la sesión:", err)
                        showAlert("error", "Error de sesión", "No se pudo establecer la sesión de recuperación.")
                    }
                }
            }

            // 2. Intentar obtener token de los query params originales
            const originalSearch = initialSearchRef.current
            if (originalSearch && !tokenFound) {
                const searchParams = new URLSearchParams(originalSearch)
                const tokenParam = searchParams.get("token")

                if (tokenParam) {
                    console.log("Token encontrado en search original:", tokenParam)
                    tokenFound = true
                    setToken(tokenParam)
                }
            }

            // 3. Intentar obtener token de la URL actual (fallback)
            if (!tokenFound) {
                // Intentar obtener de la ubicación actual
                const currentHash = window.location.hash
                const currentHashParams = parseHash(currentHash)
                const currentAccessToken = currentHashParams.get("access_token")

                if (currentAccessToken) {
                    console.log("Token encontrado en hash actual:", currentAccessToken)
                    tokenFound = true
                    setAccessToken(currentAccessToken)

                    // Configurar sesión de Supabase
                    try {
                        const { error } = await supabase.auth.setSession({
                            access_token: currentAccessToken,
                            refresh_token: currentHashParams.get("refresh_token") || "",
                        })

                        if (error) {
                            console.error(error)
                            showAlert("error", "Error de sesión", "Error al establecer sesión de recuperación: " + error.message)
                        } else {
                            console.log("Sesión de Supabase establecida correctamente")
                        }
                    } catch (err) {
                        console.error("Error al establecer la sesión:", err)
                        showAlert("error", "Error de sesión", "No se pudo establecer la sesión de recuperación.")
                    }
                } else {
                    // Intentar obtener de los query params actuales
                    const currentSearchParams = new URLSearchParams(location.search)
                    const currentTokenParam = currentSearchParams.get("token")

                    if (currentTokenParam) {
                        console.log("Token encontrado en search actual:", currentTokenParam)
                        tokenFound = true
                        setToken(currentTokenParam)
                    }
                }
            }

            // Si no se encontró ningún token, mostrar error
            if (!tokenFound) {
                console.log("No se encontró ningún token")
                showAlert("error", "Enlace inválido", "El enlace de restablecimiento de contraseña es inválido o ha expirado.")
            }
        }

        // Ejecutar la captura del token
        captureTokenFromInitialUrl()
    }, [])

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

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
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

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            showAlert(
                "error",
                "Las contraseñas no coinciden",
                "Por favor, asegúrate de que ambas contraseñas sean idénticas.",
            )

            // Marcar los campos con error
            document.getElementById("password")?.classList.add("input-error")
            document.getElementById("confirmPassword")?.classList.add("input-error")

            // Quitar las clases de error después de 3 segundos
            setTimeout(() => {
                document.getElementById("password")?.classList.remove("input-error")
                document.getElementById("confirmPassword")?.classList.remove("input-error")
            }, 3000)

            return
        }

        setLoading(true)
        setError("")

        try {
            // Si tenemos un token personalizado, usar el endpoint personalizado
            if (token) {
                console.log("Usando token personalizado para restablecer contraseña")
                const response = await axios.post("http://localhost:4000/auth/reset-password", {
                    password,
                    token,
                })

                if (response.status === 200) {
                    console.log("Contraseña restablecida correctamente con token personalizado")
                    setResetSuccess(true)

                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        navigate("/login")
                    }, 3000)
                }
            }
            // Si tenemos un access_token de Supabase, usar la API de Supabase
            else if (accessToken) {
                console.log("Usando Supabase para restablecer contraseña")
                const { error } = await supabase.auth.updateUser({ password })

                if (error) {
                    console.error("Error al actualizar contraseña con Supabase:", error)
                    throw new Error(error.message)
                } else {
                    console.log("Contraseña restablecida correctamente con Supabase")
                    setResetSuccess(true)

                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        navigate("/login")
                    }, 3000)
                }
            }
            // Si no tenemos ningún token, intentar con Supabase de todas formas (por si hay una sesión activa)
            else {
                console.log("Intentando restablecer contraseña sin token")
                const { error } = await supabase.auth.updateUser({ password })

                if (error) {
                    console.error("Error al actualizar contraseña sin token:", error)
                    throw new Error(error.message)
                } else {
                    console.log("Contraseña restablecida correctamente sin token explícito")
                    setResetSuccess(true)

                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        navigate("/login")
                    }, 3000)
                }
            }
        } catch (err: any) {
            console.error("Error en handleSubmit:", err)
            const errorMessage =
                err.response?.data?.error || err.message || "Error al restablecer la contraseña. Intenta nuevamente."
            setError(errorMessage)

            // Mostrar alerta de error
            showAlert("error", "Error", errorMessage)
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
    const passwordsMatch = password === confirmPassword && password !== ""

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
                            <blockquote>"Seguridad y control en tus manos"</blockquote>
                            <cite>— Dashboard IoT</cite>
                        </div>
                    </div>
                </div>

                <div className="login-form-container">
                    <div className="login-form-header">
                        <div className="login-welcome">
                            <h2>Restablecer contraseña</h2>
                            <p>Crea una nueva contraseña para tu cuenta</p>
                        </div>
                    </div>

                    {resetSuccess ? (
                        <div className="recovery-success">
                            <CheckCircle className="success-icon" size={48} color="#10b981" />
                            <h3>¡Contraseña restablecida!</h3>
                            <p>
                                Tu contraseña ha sido actualizada correctamente. Serás redirigido a la página de inicio de sesión en
                                unos segundos.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="login-form-content">
                            <div className="form-group">
                                <label htmlFor="password">Nueva contraseña</label>
                                <div className="input-container">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ingresa tu nueva contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={togglePasswordVisibility}
                                        tabIndex={-1}
                                    >
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
                                            <li className={passwordsMatch ? "valid" : ""}>
                                                {passwordsMatch ? <Check size={14} /> : <span>○</span>} Las contraseñas coinciden
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                                <div className="input-container">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirma tu nueva contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={toggleConfirmPasswordVisibility}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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
                                        Restablecer contraseña
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
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

export default ResetPasswordForm

