"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Mail, Lock, ArrowRight, Loader, User, Leaf, Sun, Droplets, Thermometer, Check } from "lucide-react"

const RegisterForm: React.FC = () => {
    const navigate = useNavigate()
    const [name, setName] = useState("")
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
            const response = await axios.post("http://localhost:4000/auth/register", {
                email,
                password,
                name,
            })

            if (response.status === 201) {
                navigate("/")
            }
        } catch (err) {
            setError("Error al registrar el usuario. Intenta nuevamente.")
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
                                    type="password"
                                    placeholder="Crea una contraseña segura"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
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

                        {error && <div className="auth-error">{error}</div>}

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

                        {/*<div className="login-divider">
                            <span>O regístrate con</span>
                        </div>

                        <div className="social-login">
                            <button type="button" className="social-button google">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
                                    <path d="M12 8L12 16"></path>
                                    <path d="M8 12L16 12"></path>
                                </svg>
                                Google
                            </button>
                            <button type="button" className="social-button microsoft">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="10" height="10" x="3" y="3" rx="1"></rect>
                                    <rect width="10" height="10" x="11" y="11" rx="1"></rect>
                                </svg>
                                Microsoft
                            </button>
                        </div>*/}
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

