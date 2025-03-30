import axios from "axios";

const API_BASE_URL = "https://readybook-back.onrender.com/";

const api = axios.create({ 
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Enable CORS for local development
    withCredentials: false,
});

// Automatically attach token if it exists
api.interceptors.request.use(
    async (config) => {
        console.log('Entering interceptor configuration')
        const token = await localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }console.debug('returing interceptor configuration');
        return config;
    },
    (error) => {
        console.error('Error in interceptor configuration');
        return Promise.reject(error);
    }
);

export default api;
