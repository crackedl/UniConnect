import axios from 'axios';

// Create the axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Your Java Backend URL
});

// --- REQUEST INTERCEPTOR ---
// Before sending any request, check if we have a token and attach it.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
// If the backend says "Token Expired" (403), log the user out automatically.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;