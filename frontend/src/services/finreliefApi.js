import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

export function predictSettlement(payload) {
  return apiClient.post("/api/predict-settlement", payload);
}

export function generateNegotiationLetter(payload) {
  return apiClient.post("/api/generate-negotiation", payload);
}

export function getBorrowerRights() {
  return apiClient.get("/api/borrower-rights");
}