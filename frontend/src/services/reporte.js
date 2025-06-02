import axios from 'axios';
import { saveAs } from 'file-saver';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  responseType: 'blob',
});

export const getReportePedidos = async (token, params) => {
  const response = await api.get('/reportes/pedidos', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  saveAs(blob, 'reporte_pedidos.pdf');
  return response;
};

export const getReporteConductores = async (token, params) => {
  const response = await api.get('/reportes/conductores', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  saveAs(blob, 'reporte_conductores.pdf');
  return response;
};

export const getReporteRutas = async (token, params) => {
  const response = await api.get('/reportes/rutas', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  saveAs(blob, 'reporte_rutas.pdf');
  return response;
};