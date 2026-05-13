import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../auth-forms.css";

export function SignupPage() {
  const { register, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const roleRaw = fd.get("role");
    const role =
      roleRaw === "tutor" || roleRaw === "student" ? roleRaw : null;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!role) {
      setError("Choose student or tutor.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await register(email, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <h1 className="auth-page__title">Create account</h1>
      <p className="auth-page__lead">
        Sign up with email and password, then pick how you will use Hustwork.
      </p>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label className="auth-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
          />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={busy}
          />
        </label>

        <fieldset className="auth-roles">
          <legend className="auth-roles__legend">Role</legend>
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              defaultChecked
              disabled={busy}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="tutor"
              disabled={busy}
            />
            Tutor
          </label>
        </fieldset>

        <button className="auth-primary" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="auth-sub">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </main>
  );
}
