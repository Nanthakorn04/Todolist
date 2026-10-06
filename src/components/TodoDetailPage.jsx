import { todoStatuses } from "../constants.js";
import { getTodoAssigneeNames } from "../utils/todos.js";
import TodoStatusChecks from "./TodoStatusChecks.jsx";

function TodoDetailPage({ todo, users, error, onBack, onEdit, onDelete, onMove }) {
  const statusLabel = todoStatuses.find((status) => status.id === todo.status)?.label || "Todo";
  const people = getTodoAssigneeNames(todo, users);

  return (
    <section className="detail-page">
      <button className="detail-back" type="button" onClick={onBack}>← กลับไปหน้ารายการ</button>
      {error && <p className="form-error" role="alert">{error}</p>}
      <article className="detail-card">
        <header className="detail-header">
          <div>
            <span className="detail-category">{todo.category}</span>
            <h2 className="detail-title">{todo.text}</h2>
          </div>
          <span className="detail-status">{statusLabel}</span>
        </header>

        <section className="detail-description">
          <h3 className="detail-section-title">รายละเอียด</h3>
          <p>{todo.description || "ยังไม่มีรายละเอียดของงานนี้"}</p>
        </section>

        <div className="detail-meta">
          <section>
            <h3 className="detail-section-title">กำหนดส่ง</h3>
            <p>
              {todo.dueAt
                ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(todo.dueAt))
                : "ยังไม่ได้กำหนด"}
            </p>
          </section>
          <section>
            <h3 className="detail-section-title">ผู้เกี่ยวข้อง</h3>
            {people.length ? (
              <div className="assignee-tags">
                {people.map((person) => <span className="assignee-tag" key={person}>{person}</span>)}
              </div>
            ) : <p>ยังไม่ได้เลือก</p>}
          </section>
        </div>

        <div className="detail-status-controls">
          <h3 className="detail-section-title">สถานะงาน</h3>
          <TodoStatusChecks status={todo.status} onChange={onMove} />
        </div>

        <footer className="detail-actions">
          <button className="button-secondary" type="button" onClick={onEdit}>แก้ไขงาน</button>
          <button className="button-danger" type="button" onClick={onDelete}>ลบงาน</button>
        </footer>
      </article>
    </section>
  );
}

export default TodoDetailPage;
