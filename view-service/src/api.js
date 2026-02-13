import axios from 'axios';

// Environment variables (Vite requires VITE_ prefix)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8891/api';
const PROFILE_CACHE_DURATION = parseInt(import.meta.env.VITE_PROFILE_CACHE_DURATION || '5000', 10); // 5 seconds cache
const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE);

// Global profile fetch state to prevent duplicate calls
let profileFetchPromise = null;
let profileCache = null;
let profileCacheTimestamp = null;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
    // Prevent axios from caching responses
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    },
});

// Books API
export const booksAPI = {
    getAll: (skip = 0, limit = ITEMS_PER_PAGE) => api.get('/books', { params: { skip, limit } }),
    getById: (id) => api.get(`/books/${id}`),
    create: (data) => api.post('/books', data),
    update: (id, data) => api.put(`/books/${id}`, data),
    delete: (id) => api.delete(`/books/${id}`),
};

// Members API
export const membersAPI = {
    getAll: (skip = 0, limit = ITEMS_PER_PAGE) => api.get('/members', { params: { skip, limit } }),
    getById: (id) => api.get(`/members/${id}`),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`),
    getUserInfo: (id) => api.get(`/members/${id}/user`),
    getBorrowings: (id, status) => {
        const params = status ? { status_filter: status } : {};
        return api.get(`/members/${id}/borrowings`, { params });
    },
};

// Borrowings API
export const borrowingsAPI = {
    getAll: (filters = {}) => api.get('/borrowings', { params: filters }),
    getById: (id) => api.get(`/borrowings/${id}`),
    create: (data) => api.post('/borrowings', data),
    returnBook: (id, fineAmount) => api.put(`/borrowings/${id}/return`, null, {
        params: fineAmount ? { fine_amount: fineAmount } : {},
    }),
    update: (id, data) => api.put(`/borrowings/${id}`, data),
    delete: (id) => api.delete(`/borrowings/${id}`),
};

// Statistics API
export const statsAPI = {
    get: () => api.get('/stats'),
};

// Authentication API
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    signin: (data) => api.post('/auth/signin', data),
    getCurrentUser: () => api.get('/auth/me'),
    getProfile: (forceRefresh = false) => {
        // Check cache first (unless force refresh)
        const now = Date.now();
        if (!forceRefresh && profileCache && profileCacheTimestamp &&
            (now - profileCacheTimestamp) < PROFILE_CACHE_DURATION) {
            return Promise.resolve({ data: profileCache });
        }

        // If a fetch is already in progress, return the same promise
        if (profileFetchPromise && !forceRefresh) {
            return profileFetchPromise;
        }

        // Create new fetch promise
        profileFetchPromise = api.get('/profile')
            .then(response => {
                // Cache the result
                profileCache = response.data;
                profileCacheTimestamp = Date.now();
                profileFetchPromise = null; // Clear promise after completion
                return response;
            })
            .catch(error => {
                profileFetchPromise = null; // Clear promise on error
                throw error;
            });

        return profileFetchPromise;
    },
    updateProfile: (data) => {
        // Clear cache when updating profile
        profileCache = null;
        profileCacheTimestamp = null;
        return api.put('/profile', data);
    },
    clearProfileCache: () => {
        profileCache = null;
        profileCacheTimestamp = null;
        profileFetchPromise = null;
    },
};

// Dashboard API
export const dashboardAPI = {
    getDashboard: () => api.get('/dashboard'),
    getUserDashboard: () => api.get('/user/dashboard'),
};

// Testimonials API
export const testimonialsAPI = {
    getAll: (params = {}) => api.get('/testimonials', { params }),
    getById: (id) => api.get(`/testimonials/${id}`),
    create: (data) => api.post('/testimonials', data),
    update: (id, data) => api.put(`/testimonials/${id}`, data),
    delete: (id) => api.delete(`/testimonials/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
    create: (data) => api.post('/subscriptions', data),
    getAll: () => api.get('/subscriptions'),
};

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Add cache-busting for GET requests (except /profile which has app-level caching)
        if ((config.method === 'get' || config.method === 'GET') && !config.url.includes('/profile')) {
            // Merge timestamp with existing params (if any)
            const existingParams = config.params || {};
            config.params = {
                ...existingParams,
                _t: Date.now(), // Timestamp to prevent caching
            };
            // Ensure no caching
            config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            config.headers['Pragma'] = 'no-cache';
            config.headers['Expires'] = '0';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 errors (unauthorized)
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

export default api;

