import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Cambia si tu backend usa otro puerto
  withCredentials: true,
});

// Interceptor para agregar el token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api; 