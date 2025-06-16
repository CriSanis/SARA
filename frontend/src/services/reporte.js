import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getReportePedidos = async (params = {}) => {
    try {
        // Filtrar parámetros vacíos o nulos
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== null && value !== '')
        );

        const response = await axios.get(`${API_URL}/reportes/pedidos`, {
            params: filteredParams,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
        });

        // Crear un blob con la respuesta
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_pedidos.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error al obtener reporte de pedidos:', error);
        throw error;
    }
};

export const getReporteConductores = async (params = {}) => {
    try {
        // Filtrar parámetros vacíos o nulos
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== null && value !== '')
        );

        const response = await axios.get(`${API_URL}/reportes/conductores`, {
            params: filteredParams,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
        });

        // Crear un blob con la respuesta
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_conductores.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error al obtener reporte de conductores:', error);
        throw error;
    }
};