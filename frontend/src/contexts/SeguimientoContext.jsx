import React, { createContext, useContext, useState, useEffect } from 'react';
import { seguimientoService } from '../services/seguimientoService';
import { useAuth } from './AuthContext';
import Echo from 'laravel-echo';

const SeguimientoContext = createContext();

export const useSeguimiento = () => {
    const context = useContext(SeguimientoContext);
    if (!context) {
        throw new Error('useSeguimiento debe ser usado dentro de un SeguimientoProvider');
    }
    return context;
};

export const SeguimientoProvider = ({ children }) => {
    const [seguimientos, setSeguimientos] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Función para cargar el historial de seguimiento
    const cargarSeguimientos = async (pedidoId) => {
        try {
            setLoading(true);
            const data = await seguimientoService.getSeguimientos(pedidoId);
            setSeguimientos(prev => ({
                ...prev,
                [pedidoId]: data
            }));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar la ubicación (solo para conductores)
    const actualizarUbicacion = async (pedidoId, ubicacion) => {
        try {
            setLoading(true);
            await seguimientoService.updateUbicacion(pedidoId, ubicacion);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Configurar listeners de WebSocket
    useEffect(() => {
        if (user) {
            // Suscribirse a los canales de seguimiento para los pedidos activos
            Object.keys(seguimientos).forEach(pedidoId => {
                window.Echo.private(`pedido.${pedidoId}`)
                    .listen('SeguimientoActualizado', (e) => {
                        setSeguimientos(prev => ({
                            ...prev,
                            [pedidoId]: [...(prev[pedidoId] || []), e.seguimiento]
                        }));
                    });
            });
        }

        return () => {
            // Limpiar suscripciones al desmontar
            Object.keys(seguimientos).forEach(pedidoId => {
                window.Echo.leave(`pedido.${pedidoId}`);
            });
        };
    }, [user, seguimientos]);

    const value = {
        seguimientos,
        loading,
        error,
        cargarSeguimientos,
        actualizarUbicacion
    };

    return (
        <SeguimientoContext.Provider value={value}>
            {children}
        </SeguimientoContext.Provider>
    );
}; 