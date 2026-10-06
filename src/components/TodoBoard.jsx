import { todoStatuses } from "../constants.js";
import { getTodoAssigneeNames } from "../utils/todos.js";
import TodoStatusChecks from "./TodoStatusChecks.jsx";

function TodoBoard({ todos, users, hasAnyTodos, isLoading, error, onMove, onEdit, onDelete, onOpen }) {
  if (isLoading) return <p className="board-message">กำลังโหลดงาน...</p>;

  return (
    <section className="task-board" aria-label="กระดานงาน">
      {error && <p className="board-message board-error" role="alert">{error}</p>}
      {hasAnyTodos && todos.length === 0 && !error ? (
        <p className="board-message">ไม่พบงานที่ตรงกับคำค้นหาหรือตัวกรอง</p>
      ) : todoStatuses.map((status) => {
        const statusTodos = todos.filter((todo) => todo.status === status.id);

        return (
          <section className="board-column" key={status.id}>
            <header className="board-header">
              <h2 className="board-title">{status.label}</h2>
              <span className="board-count">{statusTodos.length}</span>
            </header>

            {statusTodos.map((todo) => {
              const assigneeNames = getTodoAssigneeNames(todo, users);

              return (
                <article className="task-card" key={todo.id}>
                  <p className="task-category">{todo.category}</p>
                  <h3 className="task-title">{todo.text}</h3>
                  {todo.description && <p className="task-description-preview">{todo.description}</p>}
                  {todo.dueAt && (
                    <p className="task-due">
                      กำหนดส่ง {new Intl.DateTimeFormat("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(todo.dueAt))}
                    </p>
                  )}
                  {assigneeNames.length > 0 && (
                    <div className="assignee-tags" aria-label="ผู้เกี่ยวข้อง">
                      {assigneeNames.map((person) => <span className="assignee-tag" key={person}>{person}</span>)}
                    </div>
                  )}
                  <TodoStatusChecks status={todo.status} onChange={(nextStatus) => onMove(todo, nextStatus)} />
                  <div className="task-actions">
                    <button className="button-secondary" type="button" onClick={() => onOpen(todo)}>รายละเอียด</button>
                    <button className="button-secondary" type="button" onClick={() => onEdit(todo)}>แก้ไข</button>
                    <button className="button-danger" type="button" onClick={() => onDelete(todo)}>
                      ลบ
                    </button>
                  </div>
                </article>
              );
            })}

            {statusTodos.length === 0 && <p className="empty-state">ยังไม่มีงาน</p>}
          </section>
        );
      })}
    </section>
  );
}

export default TodoBoard;
