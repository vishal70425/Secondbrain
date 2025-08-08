"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentApi = void 0;
// src/api/content.ts
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = "http://localhost:4000/api/v1";
const api = axios_1.default.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});
// attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
exports.contentApi = {
    addContent: (content) => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield api.post("/content", content);
        return data;
    }),
    getContents: () => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield api.get("/content");
        return data;
    }),
    deleteContent: (contentId) => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield api.delete("/content", { data: { contentId } });
        return data;
    }),
    shareBrain: (share) => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield api.post("/brain/share", { share });
        return data;
    }),
    getSharedBrain: (sharelink) => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield api.get(`/brain/${sharelink}`);
        return data;
    }),
};
