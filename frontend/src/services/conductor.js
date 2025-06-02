import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const verificarConductor = async (token, id, estado) => {
  return api.put(`/conductores/${id}/verificar`, { estado_verificacion: estado }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}; //analizar en caso de errores crfs