import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const apiBaseUrl = rawBaseUrl.replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

export function predictSettlement(payload) {
  return apiClient.post("/api/predict-settlement", payload);
}

export function generateNegotiationLetter(payload) {
  return apiClient.post("/api/generate-negotiation", payload);
}

export function getBorrowerRights() {
  return apiClient.get("/api/borrower-rights");
}