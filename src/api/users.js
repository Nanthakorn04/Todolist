import { apiRequest } from "./request.js";

export function getUsers() {
  return apiRequest("/api/users");
}
