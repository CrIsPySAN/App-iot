import React, { useEffect, useState } from 'react';

interface SensorData {
    id: number;
    parcela_id: number;
    humedad: number;
    temperatura: number;
    lluvia: number | null;
    sol: number | null;
    created_at: string;
    parcela_nombre: string;
    tipo_cultivo: string;
    estado: boolean;
}

const SensorView: React.FC = () => {
    const [data, setData] = useState<SensorData[]>([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/sensors')
            .then((res) => res.json())
            .then((responseData) => {
                console.log('Respuesta del backend:', responseData);
                setData(responseData);
            })
            .catch((err) => console.error(err));
    }, []);

    const sortedData = [...data].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const last5Records = sortedData.slice(-5);

    return (
        <div className="layout">
            <div className="sensors-container">
                <h2 className="sensors-title">Lecturas de Sensores</h2>

                {last5Records.map((item) => (
                    <div key={item.id} className="sensor-card">
                        <p><strong>Número de Parcela:</strong> {item.parcela_id}</p>
                        <p><strong>Nombre:</strong> {item.parcela_nombre}</p>
                        <p><strong>Tipo de Cultivo:</strong> {item.tipo_cultivo}</p>
                        <p><strong>Temperatura:</strong> {item.temperatura} °C</p>
                        <p><strong>Humedad:</strong> {item.humedad} %</p>
                        <p><strong>Lluvia:</strong> {item.lluvia ?? 'N/A'}</p>
                        <p><strong>Sol:</strong> {item.sol ?? 'N/A'}</p>
                        <p><strong>Estado:</strong> {item.estado ? 'Activa' : 'Inactiva'}</p>
                        <p><strong>Fecha de Registro:</strong> {item.created_at}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SensorView;