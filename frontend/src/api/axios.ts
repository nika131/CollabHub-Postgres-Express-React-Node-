import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response, 
    (error) => {
        const errorMessage = error.response?.data?.message || "An unexpected error occured";

        if (error.response?.status === 401 || error.response?.status === 403) {
            alert("Security Alert: " + errorMessage);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }else{
            alert("Error: " + errorMessage);
        }
        return Promise.reject(error);
    }
)

export default api;