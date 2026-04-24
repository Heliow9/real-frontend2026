import api from './api';

export async function fetchAdminNews() {
  const response = await api.get('/api/admin/news');
  return response.data;
}

export async function createNews(payload) {
  const response = await api.post('/api/admin/news', payload);
  return response.data;
}

export async function updateNews(id, payload) {
  const response = await api.put(`/api/admin/news/${id}`, payload);
  return response.data;
}

export async function deleteNews(id) {
  const response = await api.delete(`/api/admin/news/${id}`);
  return response.data;
}

export async function fetchHomeContent() {
  const response = await api.get('/api/admin/home');
  return response.data;
}

export async function fetchHomeSummary() {
  const response = await api.get('/api/admin/home/summary');
  return response.data;
}

export async function updateHomeContent(payload) {
  const response = await api.put('/api/admin/home', payload);
  return response.data;
}

export async function updateHomeStats(items) {
  const response = await api.put('/api/admin/home/stats', { items });
  return response.data;
}

export async function updateHomeDifferentials(items) {
  const response = await api.put('/api/admin/home/differentials', { items });
  return response.data;
}

export async function updateHomeAboutCards(items) {
  const response = await api.put('/api/admin/home/about-cards', { items });
  return response.data;
}

export async function updateHomeServiceCards(items) {
  const response = await api.put('/api/admin/home/service-cards', { items });
  return response.data;
}

export async function updateHomePortfolioItems(items) {
  const response = await api.put('/api/admin/home/portfolio-items', { items });
  return response.data;
}

export async function fetchMedia() {
  const response = await api.get('/api/media');
  return response.data;
}

export async function uploadMedia(formData) {
  const response = await api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deleteMediaItem(id) {
  const response = await api.delete(`/api/media/${id}`);
  return response.data;
}

export const fetchAboutContent = async () => {
  const response = await api.get('/api/admin/about');
  return response.data;
};

export const updateAboutContent = async (payload) => {
  const response = await api.put('/api/admin/about', payload);
  return response.data;
};

export const updateAboutHighlights = async (items) => {
  const response = await api.put('/api/admin/about/highlights', { items });
  return response.data;
};

export const updateAboutTimeline = async (items) => {
  const response = await api.put('/api/admin/about/timeline', { items });
  return response.data;
};

export const updateAboutValues = async (items) => {
  const response = await api.put('/api/admin/about/values', { items });
  return response.data;
};

export async function fetchAdminUsers() {
  const response = await api.get('/api/admin/users');
  return response.data;
}

export async function createAdminUser(payload) {
  const response = await api.post('/api/admin/users', payload);
  return response.data;
}

export async function updateAdminUser(id, payload) {
  const response = await api.put(`/api/admin/users/${id}`, payload);
  return response.data;
}

export async function fetchComplaints(params = {}) {
  const response = await api.get('/api/admin/complaints', { params });
  return response.data;
}

export async function fetchComplaintById(id) {
  const response = await api.get(`/api/admin/complaints/${id}`);
  return response.data;
}

export async function updateComplaintStatus(id, payload) {
  const response = await api.put(`/api/admin/complaints/${id}/status`, payload);
  return response.data;
}

export async function fetchSystemSettings() {
  const response = await api.get('/api/admin/settings');
  return response.data;
}

export async function updateSystemSettings(payload) {
  const response = await api.put('/api/admin/settings', payload);
  return response.data;
}
