import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const getAudits = async (token) => {
  return api.get('/audits', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAuditsByModel = async (token, model) => {
  return api.get(`/audits/model/${model}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAuditsByUser = async (token, userId) => {
  return api.get(`/audits/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAuditsByAction = async (token, action) => {
  return api.get(`/audits/action/${action}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}; 