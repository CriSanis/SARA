import React, { useEffect } from 'react';
import { useSeguimiento } from '../../contexts/SeguimientoContext';
import MapaSeguimiento from './MapaSeguimiento';
import { useAuth } from '../../contexts/AuthContext';

const SeguimientoPedido = ({ pedidoId }) => {
    const { seguimientos, loading, error, cargarSeguimientos } = useSeguimiento();
    const { user } = useAuth();

    useEffect(() => {
        cargarSeguimientos(pedidoId);
    }, [pedidoId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    const ubicaciones = seguimientos[pedidoId] || [];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Seguimiento del Pedido #{pedidoId}</h2>
                <MapaSeguimiento ubicaciones={ubicaciones} pedidoId={pedidoId} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Historial de Ubicaciones</h3>
                <div className="space-y-4">
                    {ubicaciones.map((ubicacion, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">
                                        Latitud: {ubicacion.ubicacion_actual.latitud}
                                    </p>
                                    <p className="font-medium">
                                        Longitud: {ubicacion.ubicacion_actual.longitud}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(ubicacion.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SeguimientoPedido; 