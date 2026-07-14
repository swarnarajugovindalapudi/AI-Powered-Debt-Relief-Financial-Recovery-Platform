import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawBaseUrl) {
  throw new Error("CRITICAL: VITE_API_BASE_URL environment variable is missing. You must configure the Render backend URL in your Vercel environment settings.");
}

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