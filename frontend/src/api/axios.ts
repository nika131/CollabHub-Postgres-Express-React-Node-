import axios from 'axios';
import toast from 'react-hot-toast';


const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = []
}

api.interceptors.request.use((config) => {
    (config as any).metadata = { startTime: performance.now() };

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        const duration = Math.round(performance.now() - (response.config as any).metadata.startTime)
        console.log(`%c[API Success] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`, 'color: #4abe80; font-weight: bold;');
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "An unexpected error occured";


        if (status === 401 && errorMessage === "Access token expired" && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization =  `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }
            
            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true})
                    .then(({ data }) => {
                        localStorage.setItem('token', data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        originalRequest.headers.Authorization = `Bearer ${data.token}`;
                        processQueue(null, data.token);
                        resolve(api(originalRequest));
                    })
                    .catch((err) => {
                        processQueue(err, null);
                        handleLogout("Session expired. Please login again.");
                        reject(err);
                    })
                    .finally(() => { isRefreshing = false; });
            })
        }
        if(status !== 400) {
            console.groupCollapsed(`API Error: [${error.config?.method?.toUpperCase()}] ${error.config?.url}`);
            console.error("Status Code:", status);
            console.error("Backend Message:", errorMessage);
            console.error("Full Error Object:", error);
            console.groupEnd();
        }

        if (status === 401 || status === 403) {
            handleLogout(errorMessage);
        }else if (status === 400) {
            toast.error("Error: " + errorMessage);
        }else {
            toast.error("Error: " + errorMessage);
        }

        return Promise.reject(error);
    }
)

const handleLogout = (message: string ) => {
    toast.error("Security Alert:" + message);
    localStorage.removeItem('token');
            localStorage.removeItem('user_info');

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
}

export default api;