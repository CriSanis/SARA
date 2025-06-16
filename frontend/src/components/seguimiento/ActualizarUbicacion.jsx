import React, { useState, useEffect } from 'react';
import { useSeguimiento } from '../../contexts/SeguimientoContext';

const ActualizarUbicacion = ({ pedidoId }) => {
    const [ubicacion, setUbicacion] = useState({ latitud: '', longitud: '' });
    const [error, setError] = useState(null);
    const { actualizarUbicacion, loading } = useSeguimiento();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!ubicacion.latitud || !ubicacion.longitud) {
            setError('Por favor, ingresa las coordenadas');
            return;
        }

        try {
            await actualizarUbicacion(pedidoId, ubicacion);
            setUbicacion({ latitud: '', longitud: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    // Obtener la ubicación actual del dispositivo
    const obtenerUbicacionActual = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUbicacion({
                        latitud: position.coords.latitude,
                        longitud: position.coords.longitude
                    });
                },
                (error) => {
                    setError('Error al obtener la ubicación: ' + error.message);
                }
            );
        } else {
            setError('La geolocalización no está soportada en este navegador');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Actualizar Ubicación</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Latitud
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={ubicacion.latitud}
                            onChange={(e) => setUbicacion(prev => ({ ...prev, latitud: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Ej: 19.4326"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Longitud
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={ubicacion.longitud}
                            onChange={(e) => setUbicacion(prev => ({ ...prev, longitud: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Ej: -99.1332"
                        />
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={obtenerUbicacionActual}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Obtener Ubicación Actual
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Ubicación'}
                    </button>
                </div>

                {error && (
                    <div className="text-red-600 text-sm mt-2">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ActualizarUbicacion; 