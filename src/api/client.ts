import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { normalizeApiError } from "./errors";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api/v1";
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── REQUEST INTERCEPTOR: Attach JWT ──
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── RESPONSE INTERCEPTOR: Refresh token on 401 ──
type QueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: AxiosError | Error | null) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: AxiosError | Error | null, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (!originalRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        sessionStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        sessionStorage.clear();
        window.location.assign("/login");

        return Promise.reject(normalizeApiError(refreshError, { action: "refresh your session" }));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export default api;
