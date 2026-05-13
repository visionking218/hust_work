import { useContext, useEffect, useState } from "react";
import type { UserRole } from "../@types";
import { GlobalContext } from "../context";
import {
  LOCAL_STORAGE_MY_TUTOR_ID_KEY,
  LOCAL_STORAGE_USER_ROLE_KEY,
} from "../lib/localStorageKeys";
import { getTutorByTutorId } from "../service/tutorService";

function isStoredRole(value: string | null): value is Exclude<UserRole, "unset"> {
  return value === "tutor" || value === "student";
}

export function useHomePage() {
  const ctx = useContext(GlobalContext);
  const [hydratedFromStorage, setHydratedFromStorage] = useState(false);

  useEffect(() => {
    if (!ctx?.update) return;
    if (ctx.state.authUser) {
      setHydratedFromStorage(true);
      return;
    }
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_ROLE_KEY);
      if (isStoredRole(stored)) {
        ctx.update({ userRole: stored });
      }
    } catch {
      /* ignore */
    }
    setHydratedFromStorage(true);
  }, [ctx?.update, ctx?.state.authUser]);

  useEffect(() => {
    if (!ctx?.update) return;
    let cancelled = false;
    let myId: string | null = null;
    try {
      myId = localStorage.getItem(LOCAL_STORAGE_MY_TUTOR_ID_KEY);
    } catch {
      myId = null;
    }
    if (!myId) return;
    void (async () => {
      try {
        const tutor = await getTutorByTutorId(myId);
        if (!cancelled && tutor) {
          ctx.update({
            currentTutorId: myId,
            currentTutorInfo: tutor,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ctx?.update]);

  const handleRoleSelect = (role: Exclude<UserRole, "unset">) => {
    if (!ctx?.update) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_ROLE_KEY, role);
    } catch {
      /* ignore */
    }
    ctx.update({ userRole: role });
  };

  const showRoleModal =
    ctx !== null &&
    hydratedFromStorage &&
    ctx.state.userRole === "unset" &&
    ctx.state.authUser === null;

  return {
    ctx,
    hydratedFromStorage,
    showRoleModal,
    handleRoleSelect,
  };
}
