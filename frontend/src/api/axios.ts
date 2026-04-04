import axios from 'axios';
import toast from 'react-hot-toast';

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
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "An unexpected error occured";

        if(status !== 400) {
            console.groupCollapsed(`API Error: [${error.config?.method?.toUpperCase()}] ${error.config?.url}`);
            console.error("Status Code:", status);
            console.error("Backend Message:", errorMessage);
            console.error("Full Error Object:", error);
            console.groupEnd();
        }

        if (status === 401 || status === 403) {
            toast.error("Security Alert: " + errorMessage);
            localStorage.removeItem('token');
            localStorage.removeItem('user_info');

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }else if (status === 400) {

        }else {
            toast.error("Error: " + errorMessage);
        }

        return Promise.reject(error);
    }
)

export default api;