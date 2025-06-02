import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const getPedidos = async (token) => {
  return api.get('/pedidos', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createPedido = async (token, data) => {
  return api.post('/pedidos', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updatePedido = async (token, id, data) => {
  return api.put(`/pedidos/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deletePedido = async (token, id) => {
  return api.delete(`/pedidos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const asignarConductor = async (token, data) => {
  return api.post('/pedido-conductor', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};