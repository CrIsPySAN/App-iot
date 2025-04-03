import type React from "react"
import { Navigate, useLocation } from "react-router-dom"

// Componente para proteger rutas de autenticación (login, register, etc.)
// Redirige a usuarios ya autenticados al dashboard, excepto en reset-password
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation()
    const isAuthenticated = localStorage.getItem("token") !== null

    // Verificar si estamos en la ruta de reset-password
    const isResetPasswordRoute = location.pathname.includes("reset-password")

    // Si el usuario está autenticado y NO está en la ruta de reset-password, redirigir al dashboard
    if (isAuthenticated && !isResetPasswordRoute) {
        return <Navigate to="/dashboard" replace />
    }

    // En cualquier otro caso (no autenticado o en reset-password), mostrar el contenido
    return <>{children}</>
}

export default AuthRoute

