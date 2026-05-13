import type { Tutor } from "../@types";
import "./create-tutor-modal.css";
import "./tutor-detail-modal.css";

type TutorDetailModalProps = {
  open: boolean;
  tutor: Tutor | null;
  canPay: boolean;
  isPaid: boolean;
  payBusy: boolean;
  payError: string | null;
  onPay: (tutor: Tutor) => void;
  onClose: () => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TutorDetailModal({
  open,
  tutor,
  canPay,
  isPaid,
  payBusy,
  payError,
  onPay,
  onClose,
}: TutorDetailModalProps) {
  if (!open || !tutor) return null;

  const headline = tutor.headline?.trim();
  const description = tutor.description?.trim();
  const skills = tutor.mainSkills ?? [];

  return (
    <div className="ct-modal-root" role="presentation">
      <button
        type="button"
        className="ct-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="ct-modal-dialog td-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="td-modal-title"
      >
        <div className="ct-modal-head">
          <h2 id="td-modal-title" className="ct-modal-title">
            {tutor.name}
          </h2>
          <button
            type="button"
            className="ct-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="td-modal-hero">
          {tutor.image ? (
            <img
              src={tutor.image}
              alt=""
              className="td-modal-hero-img"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="td-modal-hero-placeholder" aria-hidden>
              {initialsFromName(tutor.name)}
            </div>
          )}
        </div>

        {headline ? <p className="td-modal-headline">{headline}</p> : null}

        <dl className="td-detail-dl">
          <div className="td-detail-row">
            <dt>Tutor ID</dt>
            <dd>
              <code className="td-code">{tutor.tutorId}</code>
            </dd>
          </div>
          {tutor.tutorEmail ? (
            <div className="td-detail-row td-detail-row--full">
              <dt>Tutor email</dt>
              <dd>{tutor.tutorEmail}</dd>
            </div>
          ) : null}
          <div className="td-detail-row">
            <dt>Listed</dt>
            <dd>{tutor.isListed ? "Yes" : "No"}</dd>
          </div>
          <div className="td-detail-row">
            <dt>Open to contacts</dt>
            <dd>{tutor.acceptingContacts ? "Yes" : "No"}</dd>
          </div>
          {typeof tutor.yearsExperience === "number" ? (
            <div className="td-detail-row">
              <dt>Experience</dt>
              <dd>{tutor.yearsExperience} years</dd>
            </div>
          ) : null}
          <div className="td-detail-row">
            <dt>Hourly rate</dt>
            <dd>
              {typeof tutor.hourlyRate === "number"
                ? `$${tutor.hourlyRate} / hr`
                : "—"}
            </dd>
          </div>
          {typeof tutor.contactUnlockFee === "number" ? (
            <div className="td-detail-row">
              <dt>Contact unlock fee</dt>
              <dd>${tutor.contactUnlockFee}</dd>
            </div>
          ) : null}
          <div className="td-detail-row td-detail-row--full">
            <dt>Languages</dt>
            <dd>
              {(tutor.languages?.length ?? 0) > 0
                ? tutor.languages.join(", ")
                : "—"}
            </dd>
          </div>
          <div className="td-detail-row td-detail-row--full">
            <dt>Main skills</dt>
            <dd>
              {skills.length > 0 ? (
                <ul className="td-skills-full">
                  {skills.map((s) => (
                    <li key={s} className="td-skills-full__tag">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="td-detail-row td-detail-row--full td-detail-row--block">
            <dt>Description</dt>
            <dd className="td-description">{description ? description : "—"}</dd>
          </div>
        </dl>

        <div className="td-modal-footer">
          {canPay ? (
            <div className="td-pay-box">
              <p className="td-pay-box__status">
                Payment status:{" "}
                <strong>{isPaid ? "Paid" : "Not paid"}</strong>
              </p>
              {payError ? (
                <p className="td-pay-box__error" role="alert">
                  {payError}
                </p>
              ) : null}
              <button
                type="button"
                className="ct-btn ct-btn--primary"
                onClick={() => onPay(tutor)}
                disabled={payBusy || isPaid}
              >
                {isPaid ? "Paid" : payBusy ? "Redirecting..." : "Pay with Kaspi"}
              </button>
            </div>
          ) : null}
          <button type="button" className="ct-btn ct-btn--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
