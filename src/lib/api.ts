import axios from "axios";
import { tokenManager } from "./auth/token-manager";
import { config } from "../local_config";

const API_URL = config.api;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor для добавления токена авторизации
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.ensureValidToken();
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            tokenManager.saveTokens(data.token, data.refresh_token);
            error.config.headers.token = data.token;
            return apiClient(error.config);
          }
        } catch (refreshError) {
          tokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/cabinet/login";
          }
        }
      } else {
        tokenManager.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/cabinet/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
