import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

export const getCsrfToken = async () => {
  await api.get('/sanctum/csrf-cookie');
};

export const register = async (data) => {
  await getCsrfToken();
  return api.post('/api/register', data);
};

export const login = async (data) => {
  await getCsrfToken();
  return api.post('/api/login', data);
};

export const logout = async (token) => {
  return api.post('/api/logout', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUser = async (token) => {
  return api.get('/api/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
};