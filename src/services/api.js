import axios from 'axios';

const isProd = import.meta.env.PROD;
const defaultURL = isProd 
    ? 'https://cashflowly-backend.onrender.com/api' 
    : 'http://192.168.0.106:5000/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || defaultURL,
});

// Add interceptor for JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
