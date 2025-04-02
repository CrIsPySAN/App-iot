import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, BarChart2, Cpu, Trash2, LogOut, Settings, HelpCircle } from "lucide-react"
import { useSidebar } from "../context/SidebarContext" // Importamos el contexto
import axios from "axios"

const Sidebar: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate();
    const { collapsed } = useSidebar() // Usamos el contexto para obtener el estado

    const isActive = (path: string) => {
        return location.pathname === path ? "active" : ""
    }

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:4000/auth/logout");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    return (
        <aside className={`sidebar-container ${collapsed ? "collapsed" : "expanded"}`}>
            <nav className="sidebar-nav">
                <ul className="nav-main">
                    <li className={isActive("/")}>
                        <Link to="/">
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
                    {/*
                    <li className={isActive("/sensors")}>
                        <Link to="/sensors">
                            <Cpu size={20} />
                            <span className="nav-text">Sensores</span>
                        </Link>
                    </li>
                    */}
                    <li className={isActive("/deleted")}>
                        <Link to="/deleted">
                            <Trash2 size={20} />
                            <span className="nav-text">Parcelas Eliminadas</span>
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-divider"></div>

                <ul className="nav-secondary">
                    <li>
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
                    </li>
                    <li>
                        <a href="#logout" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span className="nav-text">Salir</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar

