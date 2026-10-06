import TodoBoard from "./TodoBoard.jsx";

function DashboardPage({
  stats,
  searchText,
  onSearchChange,
  categories,
  categoryFilter,
  onCategoryChange,
  statuses,
  statusFilter,
  onStatusChange,
  onNewTodo,
  todos,
  hasAnyTodos,
  isLoading,
  error,
  users,
  onMove,
  onEdit,
  onDelete,
  onOpen,
}) {
  return (
    <>
      <section className="summary-grid" aria-label="สรุปงาน">
        {stats.map((stat) => (
          <article className="summary-card" key={stat.label}>
            <span className="summary-label">{stat.label}</span>
            <strong className="summary-value">{stat.value}</strong>
          </article>
        ))}
      </section>

      <div className="filters-grid">
        <label className="field-label">
          ค้นหางาน
          <input
            className="field-control"
            type="search"
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ชื่องาน หมวดหมู่ หรือผู้เกี่ยวข้อง"
          />
        </label>
        <label className="field-label">
          หมวดหมู่
          <select className="field-control" value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="field-label">
          สถานะ
          <select className="field-control" value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">ทุกสถานะ</option>
            {statuses.map((status) => (
              <option value={status.id} key={status.id}>{status.label}</option>
            ))}
          </select>
        </label>
        <button className="button-primary" type="button" onClick={onNewTodo}>
          + New Task
        </button>
      </div>

      <TodoBoard
        todos={todos}
        hasAnyTodos={hasAnyTodos}
        isLoading={isLoading}
        error={error}
        users={users}
        onMove={onMove}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpen={onOpen}
      />
    </>
  );
}

export default DashboardPage;
