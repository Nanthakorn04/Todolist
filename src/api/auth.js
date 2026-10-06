import { apiRequest } from "./request.js";

export async function getCurrentUser() {
  try {
    return await apiRequest("/api/auth/me");
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function registerAccount(account) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
}

export function loginAccount(account) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
}

export function logoutAccount() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}
