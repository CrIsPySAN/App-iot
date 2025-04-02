import type React from "react"
import { Heart } from "lucide-react"

const Footer: React.FC = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <p>© {new Date().getFullYear()} Dashboard IoT - Todos los derechos reservados</p>
                <p className="footer-made-with">
                    Hecho por Diego Angel Ramirez Fernandez - SM54
                </p>
            </div>
        </footer>
    )
}

export default Footer

