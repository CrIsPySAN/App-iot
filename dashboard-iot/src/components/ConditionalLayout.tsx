import type React from "react"
import { useLocation } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import Footer from "./Footer"

interface ConditionalLayoutProps {
    children: React.ReactNode
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
    const location = useLocation()
    const path = location.pathname

    // Rutas que no deben mostrar el layout completo
    const noLayoutRoutes = ["/login", "/register"]

    // Verificar si la ruta actual está en la lista de rutas sin layout
    const shouldShowLayout = !noLayoutRoutes.includes(path)

    if (!shouldShowLayout) {
        // Si es una ruta de login o register, solo mostrar el contenido sin layout
        return <div className="auth-page">{children}</div>
    }

    // Para otras rutas, mostrar el layout completo
    return (
        <>
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content-wrapper">{children}</div>
            </div>
            <Footer />
        </>
    )
}

export default ConditionalLayout

