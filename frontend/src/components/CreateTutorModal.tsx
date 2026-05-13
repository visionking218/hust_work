import { useEffect, useState, type FormEvent } from "react";
import type { CreateTutorPayload } from "../service/tutorService";
import { splitCsv } from "../lib/splitCsv";
import "./create-tutor-modal.css";

type CreateTutorModalProps = {
  open: boolean;
  onClose: () => void;
  /** Logged-in user email; required to submit (set only when authenticated). */
  tutorEmail: string;
  onCreate: (payload: CreateTutorPayload) => Promise<void>;
};

export function CreateTutorModal({
  open,
  onClose,
  tutorEmail,
  onCreate,
}: CreateTutorModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = tutorEmail.trim();
    if (!email) {
      setError("You must be signed in to create a tutor listing.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setBusy(true);
    const payload: CreateTutorPayload = {
      tutorEmail: email,
      name,
      headline: String(fd.get("headline") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      image: String(fd.get("image") ?? "").trim(),
      mainSkills: splitCsv(String(fd.get("mainSkills") ?? "")),
      languages: splitCsv(String(fd.get("languages") ?? "")),
      yearsExperience: Number(fd.get("yearsExperience")) || 0,
      hourlyRate: Number(fd.get("hourlyRate")) || undefined,
      contactUnlockFee: Number(fd.get("contactUnlockFee")) || undefined,
      isListed: true,
      acceptingContacts: true,
    };
    try {
      await onCreate(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ct-modal-root" role="presentation">
      <button
        type="button"
        className="ct-modal-backdrop"
        aria-label="Close dialog"
        onClick={() => !busy && onClose()}
      />
      <div
        className="ct-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-modal-title"
      >
        <div className="ct-modal-head">
          <h2 id="ct-modal-title" className="ct-modal-title">
            Create tutor listing
          </h2>
          <button
            type="button"
            className="ct-modal-close"
            onClick={() => !busy && onClose()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="ct-modal-lead">
          This is saved to the database via the Hustwork API. Ensure the backend
          is running and MongoDB is connected.
        </p>
        <div className="ct-field ct-field--readonly">
          <span>Tutor email (your account)</span>
          <output className="ct-field__output" aria-live="polite">
            {tutorEmail || "—"}
          </output>
        </div>
        {error && (
          <div className="ct-modal-error" role="alert">
            {error}
          </div>
        )}
        <form className="ct-modal-form" onSubmit={handleSubmit}>
          <label className="ct-field">
            <span>Name *</span>
            <input name="name" required autoComplete="name" />
          </label>
          <label className="ct-field">
            <span>Headline</span>
            <input name="headline" placeholder="Short tagline" />
          </label>
          <label className="ct-field">
            <span>Description</span>
            <textarea name="description" rows={3} placeholder="About you" />
          </label>
          <label className="ct-field">
            <span>Image URL</span>
            <input name="image" type="url" placeholder="https://…" />
          </label>
          <label className="ct-field">
            <span>Main skills (comma-separated)</span>
            <input name="mainSkills" placeholder="React, Node" />
          </label>
          <label className="ct-field">
            <span>Languages (comma-separated)</span>
            <input name="languages" placeholder="English, Spanish" />
          </label>
          <label className="ct-field">
            <span>Years experience</span>
            <input name="yearsExperience" type="number" min={0} defaultValue={0} />
          </label>
          <label className="ct-field">
            <span>Hourly rate (USD)</span>
            <input name="hourlyRate" type="number" min={0} step={1} />
          </label>
          <label className="ct-field">
            <span>Contact unlock fee (USD)</span>
            <input name="contactUnlockFee" type="number" min={0} step={1} />
          </label>
          <div className="ct-modal-actions">
            <button type="button" className="ct-btn ct-btn--ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button
              type="submit"
              className="ct-btn ct-btn--primary"
              disabled={busy || !tutorEmail.trim()}
            >
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
