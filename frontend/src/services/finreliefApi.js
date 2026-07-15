import axios from "axios";
import { API_BASE_URL } from "../config/env";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15s to help with AI calls
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Retries and 401s
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Prevent retries on requests that shouldn't be retried
    if (!config || config._isRetry) {
      return Promise.reject(error);
    }
    
    // Check for 401 Unauthorized (exclude login/register routes)
    const isAuthRoute = config.url && (config.url.includes("/api/auth/login") || config.url.includes("/api/auth/register"));
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      // Clear token and force reload/redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("finrelief_user_email");
      localStorage.removeItem("finrelief_user_fullname");
      window.dispatchEvent(new Event("unauthorized"));
      return Promise.reject(new Error("Your session has expired. Please sign in again."));
    }

    // Determine if we should retry (Network error, 502, 503, 504)
    const isNetworkError = !error.response;
    const isRecoverableHttpError = error.response && [502, 503, 504].includes(error.response.status);
    
    if (isNetworkError || isRecoverableHttpError) {
      config._retryCount = config._retryCount || 0;
      
      const MAX_RETRIES = 3;
      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        
        // Exponential backoff to cover a ~50s cold start with 3 retries:
        // Attempt 1: 3s
        // Attempt 2: 9s
        // Attempt 3: 27s
        // Total delay ~39s, plus request timeouts
        const backoff = Math.pow(3, config._retryCount) * 1000;
        
        console.warn(`API request failed. Retrying in ${backoff}ms... (Attempt ${config._retryCount}/${MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(resolve, backoff));
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);

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

export function getUserHistory() {
  return apiClient.get("/api/history");
}