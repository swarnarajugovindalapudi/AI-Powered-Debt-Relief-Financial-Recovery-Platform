/**
 * Centralized API and environment configuration.
 * Automatically handles local development, Vercel preview, and production.
 */

// If VITE_API_BASE_URL is explicitly set, use it.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;

// Fallback logic for when environment variables are missing
function determineApiUrl() {
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, ""); // Remove trailing slashes
  }

  const hostname = window.location.hostname;

  // Local development fallback
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    console.warn("VITE_API_BASE_URL is missing. Falling back to local backend.");
    return "http://localhost:8000";
  }

  // If deployed but missing env var, try a relative or generic fallback, 
  // or throw a critical error (the original code threw an error, so we will throw here)
  throw new Error(
    "CRITICAL: VITE_API_BASE_URL environment variable is missing. " +
    "You must configure the Render backend URL in your Vercel environment settings."
  );
}

export const API_BASE_URL = determineApiUrl();
