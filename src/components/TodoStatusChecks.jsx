function TodoStatusChecks({ status, onChange }) {
  return (
    <fieldset className="status-checks">
      <legend className="sr-only">สถานะงาน</legend>
      <label className="status-check">
        <input
          className="status-checkbox"
          type="checkbox"
          checked={status === "inProgress"}
          onChange={(event) => onChange(event.target.checked ? "inProgress" : "todo")}
        />
        กำลังทำ
      </label>
      <label className="status-check">
        <input
          className="status-checkbox"
          type="checkbox"
          checked={status === "completed"}
          onChange={(event) => onChange(event.target.checked ? "completed" : "todo")}
        />
        เสร็จแล้ว
      </label>
    </fieldset>
  );
}

export default TodoStatusChecks;
