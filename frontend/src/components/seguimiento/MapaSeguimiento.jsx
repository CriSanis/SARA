import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir el ícono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapaSeguimiento = ({ ubicaciones, pedidoId }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current && ubicaciones.length > 0) {
            const ultimaUbicacion = ubicaciones[ubicaciones.length - 1];
            mapRef.current.setView(
                [ultimaUbicacion.ubicacion_actual.latitud, ultimaUbicacion.ubicacion_actual.longitud],
                13
            );
        }
    }, [ubicaciones]);

    if (!ubicaciones.length) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500">No hay ubicaciones disponibles</p>
            </div>
        );
    }

    return (
        <div className="h-96 rounded-lg overflow-hidden shadow-lg">
            <MapContainer
                center={[19.4326, -99.1332]} // Coordenadas por defecto (Ciudad de México)
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {ubicaciones.map((ubicacion, index) => (
                    <Marker
                        key={index}
                        position={[
                            ubicacion.ubicacion_actual.latitud,
                            ubicacion.ubicacion_actual.longitud
                        ]}
                    >
                        <Popup>
                            <div>
                                <p className="font-semibold">Pedido #{pedidoId}</p>
                                <p>Última actualización: {new Date(ubicacion.created_at).toLocaleString()}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapaSeguimiento; 