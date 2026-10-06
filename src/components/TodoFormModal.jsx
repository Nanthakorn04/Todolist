import { todoStatuses } from "../constants.js";

function TodoFormModal({
  isOpen,
  editingTodo,
  form,
  categories,
  users,
  onChange,
  onSubmit,
  onClose,
  isSaving,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="todo-modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 className="modal-title" id="todo-modal-title">
              {editingTodo ? "แก้ไขงาน" : "สร้างงานใหม่"}
            </h2>
          </div>
          <button
            className="button-close"
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            disabled={isSaving}
          >
            ×
          </button>
        </header>

        <form className="todo-form" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="new-todo-text">ชื่องาน</label>
          <input
            className="field-control"
            id="new-todo-text"
            autoFocus
            required
            maxLength={120}
            value={form.text}
            onChange={(event) => onChange("text", event.target.value)}
            placeholder="เช่น วางแผนงานประจำสัปดาห์"
          />

          <label className="field-label" htmlFor="todo-description">รายละเอียด</label>
          <textarea
            className="field-control"
            id="todo-description"
            rows={4}
            maxLength={2000}
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="เพิ่มข้อมูลที่ช่วยอธิบายงานนี้"
          />

          <label className="field-label" htmlFor="new-todo-category">หมวดหมู่</label>
          <select
            className="field-control"
            id="new-todo-category"
            required
            value={form.category}
            onChange={(event) => onChange("category", event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="todo-status">สถานะ</label>
          <select
            className="field-control"
            id="todo-status"
            value={form.status}
            onChange={(event) => onChange("status", event.target.value)}
          >
            {todoStatuses.map((status) => (
              <option value={status.id} key={status.id}>
                {status.label}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="todo-due-at">กำหนดวันและเวลา</label>
          <input
            className="field-control"
            id="todo-due-at"
            type="datetime-local"
            value={form.dueAt}
            onChange={(event) => onChange("dueAt", event.target.value)}
          />

          <fieldset className="assignee-field">
            <legend className="field-label">ผู้เกี่ยวข้อง</legend>
            <div className="checkbox-list">
              {users.length === 0 && <p className="empty-user-list">ไม่พบรายชื่อผู้ใช้</p>}
              {users.map((person) => (
                <label className="checkbox-row" key={person.id}>
                  <input
                    className="checkbox-input"
                    type="checkbox"
                    checked={form.assigneeIds.includes(person.id)}
                    onChange={(event) => {
                      const nextIds = event.target.checked
                        ? [...form.assigneeIds, person.id]
                        : form.assigneeIds.filter((id) => id !== person.id);

                      onChange("assigneeIds", nextIds);
                    }}
                  />
                  {person.name}
                </label>
              ))}
            </div>
            <p className="field-help">เลือกได้มากกว่า 1 คน</p>
          </fieldset>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              className="button-secondary"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              ยกเลิก
            </button>
            <button
              className="button-primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "กำลังบันทึก..."
                : editingTodo
                  ? "บันทึก"
                  : "สร้างงาน"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TodoFormModal;
