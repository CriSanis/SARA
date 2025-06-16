import api from './api';

export const seguimientoService = {
    // Obtener el historial de seguimiento de un pedido
    getSeguimientos: async (pedidoId) => {
        try {
            const response = await api.get(`/seguimientos/${pedidoId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar la ubicación actual del conductor
    updateUbicacion: async (pedidoId, ubicacion) => {
        try {
            const response = await api.post('/seguimientos', {
                pedido_id: pedidoId,
                ubicacion_actual: ubicacion
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 