import { useState } from "react";

function AuthForm({ mode, onModeChange, onSubmit, isBusy, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, email, password });
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-title">{isRegister ? "สร้างบัญชี" : "เข้าสู่ระบบ"}</h1>

        {isRegister && (
          <label className="field-label">
            ชื่อ
            <input
              className="field-control"
              autoComplete="name"
              maxLength={80}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}

        <label className="field-label">
          อีเมล
          <input
            className="field-control"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field-label">
          รหัสผ่าน {isRegister && <span>(อย่างน้อย 8 ตัว)</span>}
          <input
            className="field-control"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="button-primary" type="submit" disabled={isBusy}>
          {isBusy ? "กำลังดำเนินการ..." : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </button>

        <p className="auth-switch">
          {isRegister ? "มีบัญชีแล้ว?" : "ยังไม่มีบัญชี?"}{" "}
          <button
            className="button-link"
            type="button"
            onClick={() => onModeChange(isRegister ? "login" : "register")}
          >
            {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </p>
      </form>
    </main>
  );
}

export default AuthForm;
