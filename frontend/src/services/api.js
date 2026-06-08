import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getRevenueChart: (period) => api.get(`/dashboard/revenue-chart?period=${period}`),
  getTopProducts: () => api.get('/dashboard/top-products'),
  getCategorySales: () => api.get('/dashboard/category-sales'),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: (params) => api.get('/categories', { params }),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  toggle: (id) => api.patch(`/categories/${id}/toggle`),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  toggle: (id) => api.patch(`/products/${id}/toggle`),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  getStats: () => api.get('/orders/stats/summary'),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  updatePayment: (id, data) => api.patch(`/orders/${id}/payment`, data),
};

// ─── Customers ───────────────────────────────────────────────────────────────
export const customerApi = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  getStats: () => api.get('/customers/stats'),
  toggleBlock: (id) => api.patch(`/customers/${id}/block`),
  sendBroadcast: (id, data) => api.post(`/customers/${id}/broadcast`, data),
};

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: (group) => api.get('/settings', { params: { group } }),
  update: (data) => api.put('/settings', data),
};

export default api;
