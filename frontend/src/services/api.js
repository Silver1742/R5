import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("r5-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
