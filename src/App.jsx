import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
} from "./api/auth.js";
import { createTodo, deleteTodo, getTodos, updateTodo } from "./api/todos.js";
import { getUsers } from "./api/users.js";
import AuthForm from "./components/AuthForm.jsx";
import AppShell from "./components/AppShell.jsx";
import CategoriesPage from "./components/CategoriesPage.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import TodoDetailPage from "./components/TodoDetailPage.jsx";
import TodoFormModal from "./components/TodoFormModal.jsx";
import { todoCategories, todoStatuses } from "./constants.js";
import { getTodoAssigneeNames } from "./utils/todos.js";

const emptyTodoForm = () => ({
  text: "",
  description: "",
  category: todoCategories[0],
  status: "todo",
  dueAt: "",
  assigneeIds: [],
});

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function App() {
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [todoError, setTodoError] = useState("");
  const [page, setPage] = useState("dashboard");
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [todoForm, setTodoForm] = useState(emptyTodoForm);
  const [isSavingTodo, setIsSavingTodo] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((result) => active && setUser(result?.user || null))
      .catch((error) => active && setAuthError(error.message))
      .finally(() => active && setSessionReady(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    Promise.all([getTodos(), getUsers()])
      .then(([data, userList]) => {
        if (!active) return;
        setTodos(data);
        setUsers(userList);
        setLoadedUserId(user.id);
      })
      .catch((error) => {
        if (!active) return;
        setTodoError(error.message);
        setLoadedUserId(user.id);
      });
    return () => { active = false; };
  }, [user]);

  const todosLoading = Boolean(user && loadedUserId !== user.id);
  const categories = [...new Set([...todoCategories, ...todos.map((todo) => todo.category)])];

  async function handleAuth(account) {
    setAuthBusy(true);
    setAuthError("");
    try {
      const result = authMode === "register"
        ? await registerAccount(account)
        : await loginAccount(account);
      setTodoError("");
      setTodos([]);
      setUsers([]);
      setLoadedUserId(null);
      setUser(result.user);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutAccount();
      setUser(null);
      setTodos([]);
      setUsers([]);
      setLoadedUserId(null);
      setTodoError("");
      setCategoryFilter("all");
      setStatusFilter("all");
      setSearchText("");
      setPage("dashboard");
      setSelectedTodoId(null);
    } catch (error) {
      setTodoError(error.message);
    }
  }

  async function handleSaveTodo(event) {
    event.preventDefault();
    const text = todoForm.text.trim();
    if (!text) return;

    if (editingTodo) {
      const confirmation = await Swal.fire({
        title: "ยืนยันการแก้ไขงาน?",
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "บันทึกการแก้ไข",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#ea580c",
      });
      if (!confirmation.isConfirmed) return;
    }

    const changes = {
      text,
      description: todoForm.description.trim(),
      category: todoForm.category.trim(),
      status: todoForm.status,
      dueAt: todoForm.dueAt ? new Date(todoForm.dueAt).toISOString() : null,
      assigneeIds: todoForm.assigneeIds,
    };

    setIsSavingTodo(true);
    setTodoError("");
    try {
      if (editingTodo) {
        const updated = await updateTodo(editingTodo.id, changes);
        setTodos((current) => current.map((todo) => todo.id === updated.id ? updated : todo));
      } else {
        const created = await createTodo(changes);
        setTodos((current) => [created, ...current]);
      }
      closeTodoModal();
    } catch (error) {
      setTodoError(error.message);
    } finally {
      setIsSavingTodo(false);
    }
  }

  async function handleMoveTodo(todo, status) {
    setTodoError("");
    try {
      const updated = await updateTodo(todo.id, { status });
      setTodos((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setTodoError(error.message);
    }
  }

  async function handleDeleteTodo(todo) {
    const confirmation = await Swal.fire({
      title: "ลบงานนี้ไหม?",
      text: todo.text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบงาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmation.isConfirmed) return;

    setTodoError("");
    try {
      await deleteTodo(todo.id);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
      if (selectedTodoId === todo.id) {
        setSelectedTodoId(null);
        setPage("dashboard");
      }
      await Swal.fire({
        title: "ลบงานแล้ว",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      setTodoError(error.message);
    }
  }

  function closeTodoModal() {
    setIsModalOpen(false);
    setEditingTodo(null);
    setTodoForm(emptyTodoForm());
    setTodoError("");
  }

  function openNewTodoModal() {
    setEditingTodo(null);
    setTodoForm(emptyTodoForm());
    setTodoError("");
    setIsModalOpen(true);
  }

  function openTodoDetails(todo) {
    setSelectedTodoId(todo.id);
    setTodoError("");
    setPage("details");
  }

  function closeTodoDetails() {
    setSelectedTodoId(null);
    setPage("dashboard");
  }

  function openEditTodoModal(todo) {
    setEditingTodo(todo);
    setTodoForm({
      text: todo.text,
      description: todo.description || "",
      category: todo.category,
      status: todo.status,
      dueAt: toLocalDateTime(todo.dueAt),
      assigneeIds: todo.assigneeIds || [],
    });
    setTodoError("");
    setIsModalOpen(true);
  }

  if (!sessionReady) return <main className="page-message">กำลังตรวจสอบบัญชี...</main>;
  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onModeChange={(mode) => { setAuthMode(mode); setAuthError(""); }}
        onSubmit={handleAuth}
        isBusy={authBusy}
        error={authError}
      />
    );
  }

  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  const selectedTodo = todos.find((todo) => todo.id === selectedTodoId);
  const visibleTodos = todos.filter((todo) => {
    const matchesCategory = categoryFilter === "all" || todo.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || todo.status === statusFilter;
    const searchableText = [
      todo.text,
      todo.description,
      todo.category,
      ...getTodoAssigneeNames(todo, users),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return matchesCategory && matchesStatus && searchableText.includes(normalizedSearch);
  });
  const stats = [
    { label: "งานทั้งหมด", value: todos.length },
    ...todoStatuses.map((status) => ({
      label: status.label,
      value: todos.filter((todo) => todo.status === status.id).length,
    })),
  ];

  return (
    <AppShell
      user={user}
      page={page}
      onPageChange={(nextPage) => {
        setSelectedTodoId(null);
        setPage(nextPage);
      }}
      onLogout={handleLogout}
    >
      {todoError && page === "categories" && <p className="form-error" role="alert">{todoError}</p>}

      {page === "dashboard" ? (
        <DashboardPage
          stats={stats}
          searchText={searchText}
          onSearchChange={setSearchText}
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statuses={todoStatuses}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onNewTodo={openNewTodoModal}
          todos={visibleTodos}
          hasAnyTodos={todos.length > 0}
          isLoading={todosLoading}
          error={todoError}
          users={users}
          onMove={handleMoveTodo}
          onEdit={openEditTodoModal}
          onDelete={handleDeleteTodo}
          onOpen={openTodoDetails}
        />
      ) : page === "categories" ? (
        <CategoriesPage
          categories={categories}
          todos={todos}
          onSelect={(category) => {
            setCategoryFilter(category);
            setPage("dashboard");
          }}
        />
      ) : selectedTodo ? (
        <TodoDetailPage
          todo={selectedTodo}
          users={users}
          error={todoError}
          onBack={closeTodoDetails}
          onEdit={() => openEditTodoModal(selectedTodo)}
          onDelete={() => handleDeleteTodo(selectedTodo)}
          onMove={(status) => handleMoveTodo(selectedTodo, status)}
        />
      ) : (
        <p className="empty-state">ไม่พบงานนี้</p>
      )}

      <TodoFormModal
        isOpen={isModalOpen}
        editingTodo={editingTodo}
        form={todoForm}
        categories={categories}
        users={users}
        onChange={(field, value) => setTodoForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSaveTodo}
        onClose={closeTodoModal}
        isSaving={isSavingTodo}
        error={todoError}
      />
    </AppShell>
  );
}

export default App;
