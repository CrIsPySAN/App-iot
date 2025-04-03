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
    Leaf,
    Sun,
    Droplets,
    Thermometer,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle,
} from "lucide-react"
import LoadingScreen from "./LoadingScreen"

const LoginForm: React.FC = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeIcon, setActiveIcon] = useState(0)
    const [showLoadingScreen, setShowLoadingScreen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showLogoutAlert, setShowLogoutAlert] = useState(false)

    // Verificar si hay un mensaje de cierre de sesión exitoso
    useEffect(() => {
        const logoutSuccess = localStorage.getItem("logout_success")
        if (logoutSuccess === "true") {
            setShowLogoutAlert(true)
            localStorage.removeItem("logout_success") // Limpiar el flag

            // Ocultar la alerta después de 3 segundos
            setTimeout(() => {
                setShowLogoutAlert(false)
            }, 3000)
        }
    }, [])

    // Rotate through icons for animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIcon((prev) => (prev + 1) % 4)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const response = await axios.post("http://localhost:4000/auth/login", {
                email,
                password,
            })

            if (response.status === 200) {
                // Extraemos el token de la sesión en la respuesta
                const token = response.data.session?.access_token
                if (!token) {
                    setError("Error: no se recibió token. Verifica la configuración de tu cuenta.")
                    setLoading(false)

                    // Añadir clases de error a los inputs
                    document.getElementById("email")?.classList.add("input-error")
                    document.getElementById("password")?.classList.add("input-error")
                    return
                }

                // Guardar el token y mostrar la pantalla de carga
                localStorage.setItem("token", token)
                setShowLoadingScreen(true)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Credenciales incorrectas. Intenta nuevamente."
            setError(errorMessage)
            setLoading(false)

            // Añadir clases de error a los inputs
            document.getElementById("email")?.classList.add("input-error")
            document.getElementById("password")?.classList.add("input-error")

            // Quitar las clases de error después de 3 segundos
            setTimeout(() => {
                document.getElementById("email")?.classList.remove("input-error")
                document.getElementById("password")?.classList.remove("input-error")
            }, 3000)
        }
    }

    const handleLoadingComplete = () => {
        // Redirigir al dashboard después de que termine la animación
        // Usamos window.location.href en lugar de navigate para forzar una recarga completa
        // y evitar que se vea el login brevemente
        window.location.href = "/dashboard"
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
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

    return (
        <>
            {showLoadingScreen && (
                <LoadingScreen
                    message="Iniciando sesión"
                    subMessage="Preparando tu dashboard"
                    onComplete={handleLoadingComplete}
                    duration={2500}
                />
            )}

            {/* Alerta de cierre de sesión exitoso */}
            {showLogoutAlert && (
                <div className="alert alert-success" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
                    <CheckCircle className="alert-icon" size={20} />
                    <div className="alert-content">
                        <div className="alert-title">Sesión cerrada</div>
                        <div className="alert-message">Has cerrado sesión correctamente.</div>
                    </div>
                </div>
            )}

            <div
                className="auth-container"
                style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)" }}
            >
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
                                <blockquote>"La tecnología al servicio de la agricultura sostenible"</blockquote>
                                <cite>— Dashboard IoT</cite>
                            </div>
                        </div>
                    </div>

                    <div className="login-form-container">
                        <div className="login-form-header">
                            <div className="login-welcome">
                                <h2>Bienvenido</h2>
                                <p>Ingresa a tu cuenta para continuar</p>
                            </div>
                        </div>

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

                            <div className="form-group">
                                <div className="password-header">
                                    <label htmlFor="password">Contraseña</label>
                                    <a href="/recover-password" className="forgot-password">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div className="input-container">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
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
                                        Iniciar sesión
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>¿No tienes una cuenta?</p>
                            <a href="/register" className="register-link">
                                Crear cuenta
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginForm

