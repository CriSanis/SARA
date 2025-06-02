import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const getVehiculos = async (token) => {
  return api.get('/vehiculos', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createVehiculo = async (token, data) => {
  return api.post('/vehiculos', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateVehiculo = async (token, id, data) => {
  return api.put(`/vehiculos/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteVehiculo = async (token, id) => {
  return api.delete(`/vehiculos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};