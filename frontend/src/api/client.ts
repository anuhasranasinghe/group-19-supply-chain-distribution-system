// ============================================================
// API Client — Axios Configuration
// ============================================================
// Centralized HTTP client for all API calls. Configured with:
// - Base URL pointing to the Express backend
// - withCredentials: true for HttpOnly cookie auth
// - Response interceptor for consistent error handling
// ============================================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  // withCredentials is CRITICAL — it tells the browser to include
  // cookies (where our JWT lives) with cross-origin requests.
  // Without this, the HttpOnly auth cookie is never sent.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — normalize error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returned a structured error, extract it
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      const enhancedError = new Error(apiError.message);
      (enhancedError as any).code = apiError.code;
      (enhancedError as any).details = apiError.details;
      (enhancedError as any).status = error.response.status;
      return Promise.reject(enhancedError);
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// API Functions — Organized by Resource
// ============================================================

// --- Auth ---
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: Record<string, string>) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// --- Users ---
export const userApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/users?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// --- Products ---
export const productApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/products?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: Record<string, unknown>) => api.post('/products', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// --- Stores ---
export const storeApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/stores?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/stores/${id}`),
  create: (data: Record<string, unknown>) => api.post('/stores', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/stores/${id}`, data),
};

// --- Routes ---
export const routeApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/routes?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/routes/${id}`),
  create: (data: Record<string, unknown>) => api.post('/routes', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/routes/${id}`, data),
};

// --- Orders ---
export const orderApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/orders?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// --- Train Trips ---
export const trainTripApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/train-trips?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/train-trips/${id}`),
  create: (data: Record<string, unknown>) => api.post('/train-trips', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/train-trips/${id}`, data),
};

// --- Train Allocations ---
export const trainAllocationApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/train-allocations?page=${page}&limit=${limit}`),
  getPendingItems: () =>
    api.get('/train-allocations/pending-items'),
  create: (data: Record<string, unknown>) => api.post('/train-allocations', data),
};

// --- Trucks ---
export const truckApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/trucks?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/trucks/${id}`),
  create: (data: Record<string, unknown>) => api.post('/trucks', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/trucks/${id}`, data),
};

// --- Truck Trips ---
export const truckTripApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/truck-trips?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/truck-trips/${id}`),
  create: (data: Record<string, unknown>) => api.post('/truck-trips', data),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch(`/truck-trips/${id}`, data),
};

// --- Deliveries ---
export const deliveryApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/deliveries?page=${page}&limit=${limit}`),
  updateStatus: (id: string, delivery_status: string) =>
    api.patch(`/deliveries/${id}/status`, { delivery_status }),
};

// --- Reports ---
export const reportApi = {
  quarterlySales: (year?: number, quarter?: number) =>
    api.get('/reports/quarterly-sales', { params: { year, quarter } }),
  topProducts: (year?: number, quarter?: number) =>
    api.get('/reports/top-products', { params: { year, quarter } }),
  citySales: (startDate?: string, endDate?: string) =>
    api.get('/reports/city-sales', { params: { start_date: startDate, end_date: endDate } }),
  routeSales: (startDate?: string, endDate?: string) =>
    api.get('/reports/route-sales', { params: { start_date: startDate, end_date: endDate } }),
  workerHours: (startDate?: string, endDate?: string) =>
    api.get('/reports/worker-hours', { params: { start_date: startDate, end_date: endDate } }),
  truckUsage: (year?: number, month?: number) =>
    api.get('/reports/truck-usage', { params: { year, month } }),
  customerOrders: () => api.get('/reports/customer-orders'),
};

// --- Notifications ---
export const notificationApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
