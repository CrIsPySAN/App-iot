"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Mail, Lock, ArrowRight, Loader, Leaf, Sun, Droplets, Thermometer } from "lucide-react"

const LoginForm: React.FC = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeIcon, setActiveIcon] = useState(0)

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
                    return
                }
                localStorage.setItem("token", token)
                navigate("/dashboard")
            }
        } catch (err) {
            setError("Credenciales incorrectas. Intenta nuevamente.")
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

    return (
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
                                <a href="#" className="forgot-password">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <div className="input-container">
                                <Lock className="input-icon" size={18} />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

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
    )
}

export default LoginForm;
