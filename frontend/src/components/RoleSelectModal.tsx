import { Link } from "react-router-dom";
import type { UserRole } from "../@types";
import "./role-select-modal.css";

const PICKABLE: Exclude<UserRole, "unset">[] = ["tutor", "student"];

type RoleSelectModalProps = {
  open: boolean;
  onSelect: (role: Exclude<UserRole, "unset">) => void;
};

export function RoleSelectModal({ open, onSelect }: RoleSelectModalProps) {
  if (!open) return null;

  return (
    <div className="role-modal-root" role="presentation">
      <div className="role-modal-backdrop" />
      <div
        className="role-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
        aria-describedby="role-modal-desc"
      >
        <h2 id="role-modal-title" className="role-modal-title">
          Welcome to Hustwork
        </h2>
        <p id="role-modal-desc" className="role-modal-desc">
          Choose how you will use the site.
        </p>
        <div className="role-modal-actions">
          {PICKABLE.map((role) => (
            <button
              key={role}
              type="button"
              className={`role-modal-btn role-modal-btn--${role}`}
              onClick={() => onSelect(role)}
            >
              {role === "tutor" ? "I am a tutor" : "I am a student"}
            </button>
          ))}
        </div>
        <p className="role-modal-subtle">
          Have an account? <Link to="/login">Sign in</Link>
          {" · "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
