function AppShell({ user, page, onPageChange, onLogout, children }) {
  return (
    <div className="app-shell">
      <nav className="sidebar" aria-label="เมนูหลัก">
        <h2 className="sidebar-brand">Todolist</h2>
        <button
          className={`sidebar-link ${page !== "categories" ? "sidebar-link-active" : "sidebar-link-idle"}`}
          type="button"
          onClick={() => onPageChange("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`sidebar-link ${page === "categories" ? "sidebar-link-active" : "sidebar-link-idle"}`}
          type="button"
          onClick={() => onPageChange("categories")}
        >
          Categories
        </button>
        <div className="sidebar-account">
          <span className="sidebar-user">{user.name}</span>
          <button className="sidebar-logout" type="button" onClick={onLogout}>
            Logout
          </button>
          
        </div>
      </nav>

      <main className="page-main">
        <header className="page-banner">
          <p className="page-kicker">
            {page === "dashboard" ? "YOUR TASKS" : page === "categories" ? "ORGANIZE YOUR TASKS" : "TASK DETAILS"}
          </p>
          <h1 className="page-title">
            {page === "dashboard" ? "My Project" : page === "categories" ? "Categories" : "Task Details"}
          </h1>
        </header>
        {children}
      </main>
    </div>
  );
}

export default AppShell;
