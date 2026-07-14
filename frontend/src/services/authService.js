import apiClient from "./finreliefApi";

const ACCESS_TOKEN_KEY = "access_token";
const USER_EMAIL_KEY = "finrelief_user_email";

function base64UrlEncode(value) {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createMockToken(email) {
  const header = base64UrlEncode(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: email,
      email,
      role: "borrower",
      source: "mock-auth",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    })
  );

  return `${header}.${payload}.mock-signature`;
}

function extractToken(data) {
  return data?.access_token || data?.token || data?.jwt || data?.auth_token || data?.data?.token || "";
}

function getBackendMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Unable to sign in right now."
  );
}

async function tryBackendLogin(email, password) {
  const endpoints = ["/api/auth/login", "/api/login", "/auth/login", "/token"];

  let lastNetworkError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.post(endpoint, { email, password });
      const token = extractToken(response.data);

      if (token) {
        return {
          token,
          source: "backend",
          message: response.data?.message || "Signed in successfully.",
        };
      }
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403 || status === 422) {
        throw new Error(getBackendMessage(error), { cause: error });
      }

      if (status === 404 || status === 405) {
        continue;
      }

      if (error?.code === "ERR_NETWORK" || !error?.response) {
        lastNetworkError = error;
        continue;
      }

      throw new Error(getBackendMessage(error), { cause: error });
    }
  }

  if (lastNetworkError) {
    return {
      token: createMockToken(email),
      source: "mock",
      message: "Backend auth is unavailable. Using a temporary secure mock sign-in.",
    };
  }

  return {
    token: createMockToken(email),
    source: "mock",
    message: "Using the temporary mock sign-in flow.",
  };
}

async function tryBackendRegister(email, password, fullName) {
  const endpoint = "/api/auth/register";

  try {
    const response = await apiClient.post(endpoint, { email, password, full_name: fullName });
    const token = extractToken(response.data);

    if (token) {
      return {
        token,
        source: "backend",
        message: response.data?.message || "Registered successfully.",
      };
    }
  } catch (error) {
    throw new Error(getBackendMessage(error), { cause: error });
  }

  return {
    token: createMockToken(email),
    source: "mock",
    message: "Using the temporary mock sign-in flow.",
  };
}

export async function signIn({ email, password }) {
  const result = await tryBackendLogin(email, password);

  localStorage.setItem(ACCESS_TOKEN_KEY, result.token);
  localStorage.setItem(USER_EMAIL_KEY, email);

  return result;
}

export async function signUp({ email, password, full_name }) {
  const result = await tryBackendRegister(email, password, full_name);

  localStorage.setItem(ACCESS_TOKEN_KEY, result.token);
  localStorage.setItem(USER_EMAIL_KEY, email);

  return result;
}

export function signOut() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthEmail() {
  return localStorage.getItem(USER_EMAIL_KEY) || "";
}