import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mutex for token refresh — prevents parallel 401s from triggering multiple refreshes
let refreshPromise: Promise<string> | null = null;

// Response interceptor: handle 401 token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // If a refresh is already in flight, wait for it
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${api.defaults.baseURL}users/auth/token/refresh/`, {
              refresh: refreshToken,
            })
            .then((response) => {
              const { access, refresh } = response.data;
              localStorage.setItem("access_token", access);
              if (refresh) {
                localStorage.setItem("refresh_token", refresh);
              }
              return access as string;
            });
        }

        const access = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
