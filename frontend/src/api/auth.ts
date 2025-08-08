// src/api/auth.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// automatically attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface SignupResult {
  message: string;
  user: { _id: string; username: string };
}

export interface SigninResult {
  message: string;
  token: string;
}

export const authApi = {
  signup: async (username: string, password: string): Promise<SignupResult> => {
    const { data } = await api.post<SignupResult>("/signup", {
      username,
      password,
    });
    return data;
  },

  signin: async (username: string, password: string): Promise<SigninResult> => {
    const { data } = await api.post<SigninResult>("/signin", {
      username,
      password,
    });
    // store token for later requests
    localStorage.setItem("token", data.token);
    return data;
  },

  signout: () => {
    localStorage.removeItem("token");
  },
};
