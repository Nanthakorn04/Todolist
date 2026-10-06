import express from "express";
import { ObjectId } from "mongodb";
import {
  clearSessionCookie,
  getSessionUserId,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "./auth.js";
import { getTodosCollection, getUsersCollection } from "./db.js";

const app = express();
const defaultCategory = "Personal";
const statuses = ["todo", "inProgress", "completed"];
app.use(express.json({ limit: "10kb" }));

let usersIndexPromise;
async function getUsers() {
  const collection = await getUsersCollection();
  usersIndexPromise ??= collection.createIndex({ email: 1 }, { unique: true });
  await usersIndexPromise;
  return collection;
}

function toUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

function toTodo(todo) {
  const status = statuses.includes(todo.status)
    ? todo.status
    : todo.completed
      ? "completed"
      : "todo";
  const dueDate = todo.dueAt ? new Date(todo.dueAt) : null;
  return {
    id: todo._id.toString(),
    text: todo.text,
    description: typeof todo.description === "string" ? todo.description : "",
    status,
    completed: status === "completed",
    category: typeof todo.category === "string" && todo.category.trim()
      ? todo.category.trim()
      : defaultCategory,
    dueAt: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toISOString() : null,
    assigneeIds: Array.isArray(todo.assigneeIds)
      ? todo.assigneeIds.map((id) => id.toString())
      : [],
    assignees: Array.isArray(todo.assignees)
      ? todo.assignees.filter((person) => typeof person === "string")
      : [],
  };
}

async function parseAssigneeIds(value) {
  if (!Array.isArray(value) || value.length > 10) return null;
  if (value.some((id) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))) return null;
  const ids = [...new Set(value)].map((id) => new ObjectId(id));
  const matches = await (await getUsers()).countDocuments({ _id: { $in: ids } });
  return matches === ids.length ? ids : null;
}

function parseDueDate(value) {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function requireAuth(request, response, next) {
  try {
    request.userId = getSessionUserId(request);
  } catch (error) {
    return next(error);
  }

  if (!request.userId) {
    return response.status(401).json({ message: "Please log in" });
  }
  next();
}

app.get("/api/health", (_request, response) => {
  response.json({ message: "API works" });
});

app.post("/api/auth/register", async (request, response) => {
  const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
  const email = typeof request.body?.email === "string"
    ? request.body.email.trim().toLowerCase()
    : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";

  if (!name || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ message: "Enter a valid name and email" });
  }
  if (password.length < 8 || password.length > 128) {
    return response.status(400).json({ message: "Password must be 8–128 characters" });
  }

  const users = await getUsers();
  const isFirstUser = (await users.countDocuments()) === 0;
  let result;
  try {
    result = await users.insertOne({
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: "An account with this email already exists" });
    }
    throw error;
  }

  if (isFirstUser) {
    const todos = await getTodosCollection();
    await todos.updateMany({ userId: { $exists: false } }, { $set: { userId: result.insertedId } });
  }

  setSessionCookie(response, result.insertedId);
  response.status(201).json({ user: toUser({ _id: result.insertedId, name, email }) });
});

app.post("/api/auth/login", async (request, response) => {
  const email = typeof request.body?.email === "string"
    ? request.body.email.trim().toLowerCase()
    : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  const users = await getUsers();
  const user = await users.findOne({ email });

  if (!user || !(await verifyPassword(password, user.passwordHash || ""))) {
    return response.status(401).json({ message: "Email or password is incorrect" });
  }

  setSessionCookie(response, user._id);
  response.json({ user: toUser(user) });
});

app.get("/api/auth/me", requireAuth, async (request, response) => {
  const user = await (await getUsers()).findOne({ _id: request.userId });
  if (!user) {
    clearSessionCookie(response);
    return response.status(401).json({ message: "Please log in" });
  }
  response.json({ user: toUser(user) });
});

app.post("/api/auth/logout", (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

app.get("/api/users", requireAuth, async (_request, response) => {
  const users = await (await getUsers())
    .find({}, { projection: { name: 1 } })
    .sort({ name: 1 })
    .toArray();
  response.json(users.map((user) => ({ id: user._id.toString(), name: user.name })));
});

app.use("/api/todos", requireAuth);

app.get("/api/todos", async (request, response) => {
  const todos = await getTodosCollection();
  const documents = await todos
    .find({ userId: request.userId })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();
  response.json(documents.map(toTodo));
});

app.post("/api/todos", async (request, response) => {
  const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";
  const description = typeof request.body?.description === "string"
    ? request.body.description.trim()
    : "";
  const category = typeof request.body?.category === "string"
    ? request.body.category.trim()
    : defaultCategory;
  if (!text) return response.status(400).json({ message: "Task name is required" });
  if (text.length > 120) return response.status(400).json({ message: "Task name is too long" });
  if (description.length > 2000) {
    return response.status(400).json({ message: "Task details must be 2,000 characters or fewer" });
  }
  if (!category || category.length > 40) {
    return response.status(400).json({ message: "Category must be 1–40 characters" });
  }
  const status = typeof request.body?.status === "string" ? request.body.status : "todo";
  if (!statuses.includes(status)) {
    return response.status(400).json({ message: "Choose a valid task status" });
  }
  const dueAt = request.body?.dueAt === undefined ? null : parseDueDate(request.body.dueAt);
  if (dueAt === undefined) return response.status(400).json({ message: "Enter a valid due date" });
  const assigneeIds = request.body?.assigneeIds === undefined
    ? []
    : await parseAssigneeIds(request.body.assigneeIds);
  if (!assigneeIds) return response.status(400).json({ message: "Choose up to 10 valid users" });

  const todo = {
    text,
    description,
    category,
    status,
    completed: status === "completed",
    dueAt,
    assigneeIds,
    userId: request.userId,
    createdAt: new Date(),
  };
  const result = await (await getTodosCollection()).insertOne(todo);
  response.status(201).json(toTodo({ ...todo, _id: result.insertedId }));
});

app.patch("/api/todos/:id", async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    return response.status(404).json({ message: "Task not found" });
  }

  const updates = {};
  if (typeof request.body?.text === "string") {
    const text = request.body.text.trim();
    if (!text || text.length > 120) {
      return response.status(400).json({ message: "Task name must be 1–120 characters" });
    }
    updates.text = text;
  }
  if (typeof request.body?.description === "string") {
    const description = request.body.description.trim();
    if (description.length > 2000) {
      return response.status(400).json({ message: "Task details must be 2,000 characters or fewer" });
    }
    updates.description = description;
  }
  if (typeof request.body?.status === "string") {
    if (!statuses.includes(request.body.status)) {
      return response.status(400).json({ message: "Choose a valid task status" });
    }
    updates.status = request.body.status;
    updates.completed = request.body.status === "completed";
  } else if (typeof request.body?.completed === "boolean") {
    updates.completed = request.body.completed;
    updates.status = request.body.completed ? "completed" : "todo";
  }
  if (typeof request.body?.category === "string") {
    const category = request.body.category.trim();
    if (!category || category.length > 40) {
      return response.status(400).json({ message: "Category must be 1–40 characters" });
    }
    updates.category = category;
  }
  if (Object.hasOwn(request.body || {}, "dueAt")) {
    const dueAt = parseDueDate(request.body.dueAt);
    if (dueAt === undefined) return response.status(400).json({ message: "Enter a valid due date" });
    updates.dueAt = dueAt;
  }
  if (Object.hasOwn(request.body || {}, "assigneeIds")) {
    const assigneeIds = await parseAssigneeIds(request.body.assigneeIds);
    if (!assigneeIds) return response.status(400).json({ message: "Choose up to 10 valid users" });
    updates.assigneeIds = assigneeIds;
  }
  if (!Object.keys(updates).length) {
    return response.status(400).json({ message: "No valid task changes provided" });
  }

  const todo = await (await getTodosCollection()).findOneAndUpdate(
    { _id: new ObjectId(request.params.id), userId: request.userId },
    { $set: updates },
    { returnDocument: "after" },
  );
  if (!todo) return response.status(404).json({ message: "Task not found" });
  response.json(toTodo(todo));
});

app.delete("/api/todos/:id", async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    return response.status(404).json({ message: "Task not found" });
  }

  const result = await (await getTodosCollection()).deleteOne({
    _id: new ObjectId(request.params.id),
    userId: request.userId,
  });
  if (!result.deletedCount) return response.status(404).json({ message: "Task not found" });
  response.status(204).end();
});

app.use((error, _request, response, _next) => {
  console.error("API error:", error);
  response.status(503).json({ message: "Service temporarily unavailable" });
});

export default app;
