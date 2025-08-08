// src/api/content.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ContentItem {
  _id: string;
  link: string;
  title: string;
  type: string;
  tags: any[];
  userId: string[];
}

export const contentApi = {
  addContent: async (content: {
    link: string;
    type: string;
    title: string;
  }): Promise<{ message: string; content: ContentItem }> => {
    const { data } = await api.post("/content", content);
    return data;
  },

  getContents: async (): Promise<{ contents: ContentItem[] }> => {
    const { data } = await api.get("/content");
    return data;
  },

  deleteContent: async (contentId: string): Promise<{ message: string }> => {
    const { data } = await api.delete("/content", { data: { contentId } });
    return data;
  },

  shareBrain: async (
    share: boolean
  ): Promise<{ hash: string } | { message: string }> => {
    const { data } = await api.post("/brain/share", { share });
    return data;
  },

  getSharedBrain: async (
    sharelink: string
  ): Promise<{ username: string; content: ContentItem[] }> => {
    const { data } = await api.get(`/brain/${sharelink}`);
    return data;
  },
};
