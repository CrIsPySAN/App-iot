"use client"

import type React from "react"
import { Menu, Bell } from "lucide-react"
import { useSidebar } from "../context/SidebarContext" // Importamos el contexto

const Header: React.FC = () => {
    const { toggleSidebar } = useSidebar() // Usamos el contexto para controlar el sidebar

    return (
        <header className="header-container">
            <div className="header-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <Menu size={20} className="menu-icon" />
                </button>
                <div className="header-logo">
                    <span className="logo-text">Dashboard IoT</span>
                </div>
            </div>

            <div className="header-right">
                {/*<button className="notification-btn">
                    <Bell size={18} />
                    <span className="notification-badge">3</span>
                </button>*/}
                <div className="user-profile">
                    <span className="user-initials">RV</span>
                    <div className="user-info">
                        <span className="user-name">Admin</span>
                        <span className="user-role">Administrador</span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header

