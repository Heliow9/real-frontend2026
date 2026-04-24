import api from './api';

export async function loginRequest(payload) {
  const response = await api.post('/api/auth/login', payload);
  return response.data;
}

export async function meRequest() {
  const response = await api.get('/api/auth/me');
  return response.data;
}

export async function refreshRequest(refreshToken) {
  const response = await api.post('/api/auth/refresh', { refreshToken });
  return response.data;
}

export async function activateAccountRequest(payload) {
  const response = await api.post('/api/auth/activate', payload);
  return response.data;
}

export async function forgotPasswordRequest(payload) {
  const response = await api.post('/api/auth/password/forgot', payload);
  return response.data;
}

export async function changePasswordRequest(payload) {
  const response = await api.post('/api/auth/password/change', payload);
  return response.data;
}
