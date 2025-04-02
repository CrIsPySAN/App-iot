import type React from "react"
import GraphicView from "./GraphicView"

const ChartsPage: React.FC = () => {
    return (
        <>
            <div className="charts-page-header">
                <h2>Gráficas y Análisis</h2>
                <p className="charts-page-description">Visualización de datos históricos de sensores y métricas ambientales</p>
            </div>
            <GraphicView />
        </>
    )
}

export default ChartsPage

