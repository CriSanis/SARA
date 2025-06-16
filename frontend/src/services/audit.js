import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

const modelMapping = {
  'pedido': 'App\\Models\\Pedido',
  'conductor': 'App\\Models\\Conductor',
  'asociacion': 'App\\Models\\Asociacion',
  'usuario': 'App\\Models\\User',
  'vehiculo': 'App\\Models\\Vehiculo'
};

export const getAudits = async (token, filters = {}) => {
  // Asegurarnos de que los filtros no sean undefined o null
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Si es el filtro de modelo, mapear al namespace completo
      if (key === 'model') {
        acc['model_type'] = modelMapping[value] || value;
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {});

  console.log('Filtros limpios:', cleanFilters); // Log de los filtros limpios

  const response = await api.get('/audits', {
    headers: { Authorization: `Bearer ${token}` },
    params: cleanFilters
  });

  console.log('URL de la petición:', response.config.url); // Log de la URL
  console.log('Parámetros enviados:', response.config.params); // Log de los parámetros

  return response;
};

export const getAuditsByModel = async (token, model) => {
  return getAudits(token, { model });
};

export const getAuditsByUser = async (token, userId) => {
  return getAudits(token, { user_id: userId });
};

export const getAuditsByAction = async (token, action) => {
  return getAudits(token, { action });
}; 