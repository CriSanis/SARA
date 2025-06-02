import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const getAsociaciones = async (token) => {
  return api.get('/asociaciones', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createAsociacion = async (token, data) => {
  return api.post('/asociaciones', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateAsociacion = async (token, id, data) => {
  return api.put(`/asociaciones/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteAsociacion = async (token, id) => {
  return api.delete(`/asociaciones/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const asignarConductor = async (token, data) => {
  return api.post('/asociacion-conductores', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const desasignarConductor = async (token, id) => {
  return api.delete(`/asociacion-conductores/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};