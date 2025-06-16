import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SeguimientoPedido from '../components/seguimiento/SeguimientoPedido';
import ActualizarUbicacion from '../components/seguimiento/ActualizarUbicacion';

const SeguimientoPage = () => {
    const { pedidoId } = useParams();
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {user?.role === 'driver' && (
                    <ActualizarUbicacion pedidoId={pedidoId} />
                )}
                <SeguimientoPedido pedidoId={pedidoId} />
            </div>
        </div>
    );
};

export default SeguimientoPage; 