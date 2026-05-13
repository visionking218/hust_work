import type { Tutor } from "../@types";
import "./tutor-card.css";

type TutorCardProps = {
  tutor: Tutor;
  onSelect?: () => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TutorCard({ tutor, onSelect }: TutorCardProps) {
  const headline = tutor.headline?.trim();
  const skills = tutor.mainSkills ?? [];

  const className =
    "tutor-card" + (onSelect ? " tutor-card--interactive" : "");

  const inner = (
    <>
      <div className="tutor-card__media">
        {tutor.image ? (
          <img
            src={tutor.image}
            alt=""
            className="tutor-card__img"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="tutor-card__placeholder" aria-hidden>
            {initialsFromName(tutor.name)}
          </div>
        )}
      </div>
      <div className="tutor-card__body">
        <h2 className="tutor-card__name">{tutor.name}</h2>
        {headline ? <p className="tutor-card__headline">{headline}</p> : null}
        <dl className="tutor-card__meta">
          {typeof tutor.yearsExperience === "number" ? (
            <div className="tutor-card__meta-row">
              <dt>Experience</dt>
              <dd>{tutor.yearsExperience} yrs</dd>
            </div>
          ) : null}
          {typeof tutor.hourlyRate === "number" ? (
            <div className="tutor-card__meta-row">
              <dt>Rate</dt>
              <dd>${tutor.hourlyRate}/hr</dd>
            </div>
          ) : null}
        </dl>
        {skills.length > 0 ? (
          <ul className="tutor-card__skills" aria-label="Skills">
            {skills.slice(0, 5).map((s) => (
              <li key={s} className="tutor-card__skill-tag">
                {s}
              </li>
            ))}
            {skills.length > 5 ? (
              <li className="tutor-card__skill-tag tutor-card__skill-tag--more">
                +{skills.length - 5}
              </li>
            ) : null}
          </ul>
        ) : null}
        {(tutor.languages?.length ?? 0) > 0 ? (
          <p className="tutor-card__languages">
            {(tutor.languages ?? []).join(" · ")}
          </p>
        ) : null}
        <div className="tutor-card__badges" aria-label="Listing status">
          {tutor.isListed ? (
            <span className="tutor-card__badge tutor-card__badge--listed">Listed</span>
          ) : (
            <span className="tutor-card__badge">Unlisted</span>
          )}
          {tutor.acceptingContacts ? (
            <span className="tutor-card__badge tutor-card__badge--open">Open to contacts</span>
          ) : (
            <span className="tutor-card__badge">Contacts paused</span>
          )}
        </div>
        <p className="tutor-card__id">
          ID <code>{tutor.tutorId}</code>
        </p>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={className}
        onClick={onSelect}
        aria-label={`View profile: ${tutor.name}`}
      >
        {inner}
      </button>
    );
  }

  return <article className={className}>{inner}</article>;
}
