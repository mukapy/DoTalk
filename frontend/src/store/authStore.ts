import { create } from "zustand";
import type { User, AuthResponse, CheckEmailResponse } from "../types";
import api from "../api/axios";
import type { AxiosError } from "axios";

interface FieldErrors {
  [key: string]: string[];
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const error = err as AxiosError<FieldErrors | { detail?: string }>;
  const data = error.response?.data;
  if (!data) return fallback;

  if (typeof data === "object" && "detail" in data && typeof data.detail === "string") {
    return data.detail;
  }

  // Collect field-level errors from DRF
  const messages: string[] = [];
  for (const [field, errors] of Object.entries(data)) {
    if (Array.isArray(errors)) {
      messages.push(`${field}: ${errors.join(", ")}`);
    }
  }
  return messages.length > 0 ? messages.join("; ") : fallback;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Login with email + password
  login: (email: string, password: string) => Promise<void>;

  // Multi-step registration
  checkEmail: (email: string) => Promise<boolean>;
  register: (data: {
    email: string;
    code: number;
    password: string;
    username: string;
  }) => Promise<void>;

  // Google OAuth
  googleLogin: (token: string) => Promise<void>;

  // Fetch user profile
  fetchProfile: () => Promise<void>;

  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>("users/auth/token/obtain/", {
        email,
        password,
      });
      const { access, refresh, data } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: extractErrorMessage(err, "Invalid credentials. Please try again."),
        isLoading: false,
      });
    }
  },

  checkEmail: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<CheckEmailResponse>(
        `users/auth/check-email/${encodeURIComponent(email)}/`
      );
      set({ isLoading: false });
      return response.data.data.is_exists;
    } catch (err) {
      set({
        error: extractErrorMessage(err, "Failed to check email. Please try again."),
        isLoading: false,
      });
      return false;
    }
  },

  register: async ({ email, code, password, username }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>("users/auth/register/", {
        email,
        code,
        password,
        username,
      });
      const { access, refresh, data } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: extractErrorMessage(err, "Registration failed. Please try again."),
        isLoading: false,
      });
    }
  },

  googleLogin: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>("users/auth/google/", { token });
      const { access, refresh, data } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: extractErrorMessage(err, "Google login failed. Please try again."),
        isLoading: false,
      });
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get<User>("users/profile/me/");
      set({ user: response.data });
    } catch {
      // If fetching profile fails, user might have an expired token
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
