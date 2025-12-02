import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
};

export const channelsAPI = {
  getAll: () => api.get('/channels'),
  getOne: (id) => api.get(`/channels/${id}`),
  create: (data) => api.post('/channels', data),
  join: (id) => api.post(`/channels/${id}/join`),
  leave: (id) => api.post(`/channels/${id}/leave`),
  getMembers: (id) => api.get(`/channels/${id}/members`),
};

export const messagesAPI = {
  create: (data) => api.post('/messages', data),
  getByChannel: (channelId, page = 1, limit = 50) =>
    api.get(`/messages/channel/${channelId}`, { params: { page, limit } }),
};

export default api;

