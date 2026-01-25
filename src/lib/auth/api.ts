import { LoginRequest, LoginResponse, RefreshResponse, ClientUser } from "./types";
import { tokenManager } from "./token-manager";
import { config } from "../../local_config";

const API_URL = config.api;

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Ошибка авторизации");
    }

    const data = await response.json();

    // Проверяем что роль client
    const role = tokenManager.getRoleFromToken(data.token);
    if (role !== "client") {
      throw new Error("Неверная роль пользователя");
    }

    tokenManager.saveTokens(data.token, data.refresh_token);
    return data;
  },

  logout: async (): Promise<void> => {
    tokenManager.clearTokens();
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Не удалось обновить токен");
    }

    return response.json();
  },

  getMe: async (): Promise<ClientUser> => {
    const token = await tokenManager.ensureValidToken();
    if (!token) {
      throw new Error("Нет токена авторизации");
    }

    const response = await fetch(`${API_URL}/api/client/me`, {
      headers: {
        token: token,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить данные пользователя");
    }

    const result = await response.json();
    return result.data;
  },
};
