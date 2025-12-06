import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token from sessionStorage for every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
