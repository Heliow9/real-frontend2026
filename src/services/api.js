import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api-realenergy.duckdns.org'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('realenergy_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
