import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const getRutas = async (token) => {
  return api.get('/rutas', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createRuta = async (token, data) => {
  return api.post('/rutas', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateRuta = async (token, id, data) => {
  return api.put(`/rutas/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteRuta = async (token, id) => {
  return api.delete(`/rutas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const asignarRuta = async (token, data) => {
  return api.post('/pedido-ruta', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const desasignarRuta = async (token, id) => {
  return api.delete(`/pedido-ruta/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};