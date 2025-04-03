"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, BarChart2, Trash2, LogOut, Settings, HelpCircle } from "lucide-react"
import { useSidebar } from "../context/SidebarContext"
import axios from "axios"
import LogoutModal from "./LogoutModal"

const Sidebar: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { collapsed } = useSidebar()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const isActive = (path: string) => {
        return location.pathname === path ? "active" : ""
    }

    const handleLogout = async () => {
        // Mostrar el modal de cierre de sesión
        setShowLogoutModal(true)

        try {
            await axios.post("http://localhost:4000/auth/logout")
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
        } finally {
            // Eliminar el token después de un breve retraso para que se muestre la animación
            setTimeout(() => {
                localStorage.removeItem("token")

                // Cerrar el modal de cierre de sesión
                setShowLogoutModal(false)

                // Almacenar en localStorage que se cerró sesión exitosamente
                // para mostrar la alerta en la página de login
                localStorage.setItem("logout_success", "true")

                // Redirigir al login
                navigate("/login")
            }, 2000)
        }
    }

    const handleCloseLogoutModal = () => {
        setShowLogoutModal(false)
    }

    return (
        <>
            <LogoutModal isOpen={showLogoutModal} onClose={handleCloseLogoutModal} />

            <aside className={`sidebar-container ${collapsed ? "collapsed" : "expanded"}`}>
                <nav className="sidebar-nav">
                    <ul className="nav-main">
                        <li className={isActive("/dashboard")}>
                            <Link to="/dashboard">
                                <LayoutDashboard size={20} />
                                <span className="nav-text">Dashboard</span>
                            </Link>
                        </li>
                        <li className={isActive("/charts")}>
                            <Link to="/charts">
                                <BarChart2 size={20} />
                                <span className="nav-text">Gráficas</span>
                            </Link>
                        </li>
                        <li className={isActive("/deleted")}>
                            <Link to="/deleted">
                                <Trash2 size={20} />
                                <span className="nav-text">Parcelas Eliminadas</span>
                            </Link>
                        </li>
                    </ul>

                    <div className="sidebar-divider"></div>

                    <ul className="nav-secondary">
                        {/*<li>
                            <Link to="#settings">
                                <Settings size={20} />
                                <span className="nav-text">Configuración</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="#help">
                                <HelpCircle size={20} />
                                <span className="nav-text">Ayuda</span>
                            </Link>
                        </li>*/}
                        <li>
                            <a
                                href="#logout"
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleLogout()
                                }}
                            >
                                <LogOut size={20} />
                                <span className="nav-text">Salir</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    )
}

export default Sidebar

