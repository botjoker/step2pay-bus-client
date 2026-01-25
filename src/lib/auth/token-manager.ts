import { JWTPayload } from "./types";
import { config } from "../../local_config";

class ClientTokenManager {
  private readonly TOKEN_KEY = "cabinet_token";
  private readonly REFRESH_TOKEN_KEY = "cabinet_refresh_token";

  saveTokens(token: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  getRoleFromToken(token: string): string | null {
    try {
      const payload = this.decodeToken(token);
      return payload.role || null;
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): JWTPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  }

  async ensureValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    if (this.isTokenValid(token)) {
      return token;
    }

    // Токен истек, пытаемся обновить
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${config.api}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      this.saveTokens(data.token, data.refresh_token);
      return data.token;
    } catch {
      this.clearTokens();
      return null;
    }
  }
}

export const tokenManager = new ClientTokenManager();
