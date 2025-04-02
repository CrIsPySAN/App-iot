"use client"

import type React from "react"
import { RefreshCw } from "lucide-react"
import DeleteParc from "./DeleteParc"

const DeleteParcPage: React.FC = () => {
    return (
        <div className="deleted-parcels-container">
            <div className="deleted-parcels-header">
                <div>
                    <h2 className="deleted-parcels-title">Parcelas Eliminadas</h2>
                    <p className="deleted-parcels-description">Listado de parcelas que han sido desactivadas del sistema</p>
                </div>
                <button onClick={() => window.location.reload()} className="refresh-button">
                    <RefreshCw size={16} />
                    Actualizar
                </button>
            </div>

            <DeleteParc />
        </div>
    )
}

export default DeleteParcPage

