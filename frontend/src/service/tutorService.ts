import type { Tutor } from "../@types";
import { getApiBase } from "../lib/apiBase";

export type CreateTutorPayload = {
  tutorEmail: string;
  name: string;
  headline?: string;
  description?: string;
  image?: string;
  mainSkills?: string[];
  languages?: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  contactUnlockFee?: number;
  isListed?: boolean;
  acceptingContacts?: boolean;
};

/** GET /api/tutors — all tutor profiles */
export async function getAllTutors(): Promise<Tutor[]> {
  const res = await fetch(`${getApiBase()}/api/tutors`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || "Failed to load tutors");
  }
  return res.json() as Promise<Tutor[]>;
}

/** GET /api/tutors/get/:id — `id` is `tutorId` */
export async function getTutorByTutorId(tutorId: string): Promise<Tutor | null> {
  const res = await fetch(
    `${getApiBase()}/api/tutors/get/${encodeURIComponent(tutorId)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<Tutor>;
}

/** POST /api/tutors/create — server assigns `tutorId` */
export async function createTutor(body: CreateTutorPayload): Promise<Tutor> {
  const res = await fetch(`${getApiBase()}/api/tutors/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || "Failed to create tutor");
  }
  return res.json() as Promise<Tutor>;
}
