import { apiRequest } from "./request.js";

const todosUrl = "/api/todos";

export function getTodos() {
  return apiRequest(todosUrl);
}

export function createTodo(todo) {
  return apiRequest(todosUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
}

export function updateTodo(id, changes) {
  return apiRequest(`${todosUrl}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
}

export function deleteTodo(id) {
  return apiRequest(`${todosUrl}/${id}`, { method: "DELETE" });
}
