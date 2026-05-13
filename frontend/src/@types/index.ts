export type Tutor = {
  tutorId: string;
  /** Account email of the tutor (from sign-in); older listings may omit this. */
  tutorEmail?: string;
  name: string;
  headline: string;
  description: string;
  image: string;
  mainSkills: string[];
  languages: string[];
  yearsExperience: number;
  hourlyRate?: number;
  contactUnlockFee?: number;
  isListed: boolean;
  acceptingContacts: boolean;
};

export type UserRole = "unset" | "tutor" | "student";

/** Logged-in user from `/api/auth/login` and `/api/auth/register` */
export type AuthUser = {
  userId: string;
  email: string;
  role: "student" | "tutor";
  ispaid: boolean;
};

export type InitState = {
  tutors: Tutor[];
  currentTutorId: string;
  currentTutorInfo: Tutor | null;
  isLoading: boolean;
  error: string | null;
  userRole: UserRole;
  authToken: string | null;
  authUser: AuthUser | null;
};
