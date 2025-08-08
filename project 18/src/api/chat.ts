// src/api/chat.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Resource {
  id: string;
  title: string;
  link: string;
  score: number;
}

export interface ChatResponse {
  message: string;
  resources: Resource[];
}

export const chatApi = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>("/chat", { message });
    return data;
  },
};
