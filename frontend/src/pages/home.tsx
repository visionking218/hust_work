import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreateTutorModal } from "../components/CreateTutorModal";
import { RoleSelectModal } from "../components/RoleSelectModal";
import { TutorCard } from "../components/TutorCard";
import { TutorDetailModal } from "../components/TutorDetailModal";
import { useAuth, useHomePage, useTutorPayment } from "../hooks";
import { LOCAL_STORAGE_MY_TUTOR_ID_KEY } from "../lib/localStorageKeys";
import type { Tutor } from "../@types";
import {
  createTutor,
  getAllTutors,
  type CreateTutorPayload,
} from "../service/tutorService";
import "./home.css";

export function Home() {
  const { ctx, showRoleModal, handleRoleSelect } = useHomePage();
  const { authUser, isAuthenticated, logout } = useAuth();
  const [showCreateTutorModal, setShowCreateTutorModal] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [tutorsError, setTutorsError] = useState<string | null>(null);
  const [detailTutor, setDetailTutor] = useState<Tutor | null>(null);
  const { payBusy, payError, startKaspiPayment, clearPayError } = useTutorPayment({
    studentUserId:
      authUser && authUser.role === "student" ? authUser.userId : null,
  });

  const handleCreateTutorSubmit = useCallback(
    async (payload: CreateTutorPayload) => {
      if (!ctx?.update || !authUser?.email) return;
      const tutor = await createTutor(payload);
      try {
        localStorage.setItem(LOCAL_STORAGE_MY_TUTOR_ID_KEY, tutor.tutorId);
      } catch {
        /* ignore */
      }
      ctx.update({
        currentTutorId: tutor.tutorId,
        currentTutorInfo: tutor,
        error: null,
      });
      try {
        const list = await getAllTutors();
        console.log(list);
        setTutors(list);
        setTutorsError(null);
      } catch {
        /* list refresh is best-effort */
      }
    },
    [ctx, authUser?.email],
  );

  const userRole = ctx?.state.userRole;
  const showTutorBrowse = userRole === "tutor" || userRole === "student";

  useEffect(() => {
    if (!showTutorBrowse) return;
    let cancelled = false;
    setTutorsLoading(true);
    setTutorsError(null);
    void (async () => {
      try {
        const list = await getAllTutors();
        if (!cancelled) {
          setTutors(list);
        }
      } catch (e) {
        if (!cancelled) {
          setTutorsError(e instanceof Error ? e.message : "Failed to load tutors.");
        }
      } finally {
        if (!cancelled) setTutorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showTutorBrowse, userRole]);

  if (!ctx) {
    return (
      <main className="home">
        <p>Wrap the app with ContextProvider.</p>
      </main>
    );
  }

  const { state, update } = ctx;
  const isTutor = state.userRole === "tutor";
  const isStudent = state.userRole === "student";

  return (
    <main className="home">
      <header className="home__toolbar" aria-label="Account">
        {isAuthenticated && authUser ? (
          <>
            <span className="home__toolbar-user" title={authUser.email}>
              {authUser.email}
            </span>
            <span className="home__toolbar-meta">
              Role: <strong>{authUser.role}</strong>
            </span>
            <button
              type="button"
              className="home__toolbar-btn"
              onClick={logout}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link className="home__toolbar-link" to="/login">
              Sign in
            </Link>
            <Link className="home__toolbar-link home__toolbar-link--primary" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </header>

      <RoleSelectModal open={showRoleModal} onSelect={handleRoleSelect} />

      <CreateTutorModal
        open={showCreateTutorModal && Boolean(authUser?.email)}
        tutorEmail={authUser?.email ?? ""}
        onClose={() => setShowCreateTutorModal(false)}
        onCreate={handleCreateTutorSubmit}
      />

      <TutorDetailModal
        open={detailTutor !== null}
        tutor={detailTutor}
        canPay={Boolean(
          isStudent && isAuthenticated && authUser?.role === "student",
        )}
        isPaid={Boolean(authUser?.ispaid)}
        payBusy={payBusy}
        payError={payError}
        onPay={(tutor) => {
          void startKaspiPayment(tutor);
        }}
        onClose={() => {
          clearPayError();
          setDetailTutor(null);
        }}
      />

      {!showRoleModal && (
        <div className="home__content">
          <h1 className="home__title">Hustwork</h1>
          <p className="home__lead">
            You are using the app as a{" "}
            <strong>{isTutor ? "tutor" : "student"}</strong>.
          </p>

          {showTutorBrowse ? (
            <section className="home__tutors" aria-label="All tutors">
              <h2 className="home__section-title">Tutors</h2>
              {tutorsLoading ? (
                <p className="home__muted">Loading tutors…</p>
              ) : tutorsError ? (
                <p className="home__error" role="alert">
                  {tutorsError}
                </p>
              ) : tutors.length === 0 ? (
                <p className="home__muted">No tutor profiles yet.</p>
              ) : (
                <div className="home__tutor-grid">
                  {tutors.map((t) => (
                    <TutorCard
                      key={t.tutorId}
                      tutor={t}
                      onSelect={() => {
                        clearPayError();
                        setDetailTutor(t);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {isTutor && (
            <section className="home__tutor-actions" aria-label="Tutor listing">
              {!isAuthenticated || !authUser ? (
                <>
                  <p className="home__muted">
                    Sign in with your tutor account to create a tutor listing. Your
                    listing is linked to your email.
                  </p>
                  <Link className="home__toolbar-link home__toolbar-link--primary" to="/login">
                    Sign in
                  </Link>
                </>
              ) : !state.currentTutorInfo ? (
                <button
                  type="button"
                  className="home__btn-primary"
                  onClick={() => setShowCreateTutorModal(true)}
                >
                  Create tutor
                </button>
              ) : (
                <div className="home__tutor-saved">
                  <p>
                    Your listing is saved:{" "}
                    <strong>{state.currentTutorInfo.name}</strong>
                  </p>
                  <p className="home__muted">
                    Tutor id <code>{state.currentTutorInfo.tutorId}</code> — stored
                    in MongoDB via the API.
                  </p>
                  <button
                    type="button"
                    className="home__btn-secondary"
                    onClick={() => {
                      update({ error: null });
                      setShowCreateTutorModal(true);
                    }}
                  >
                    Create another listing
                  </button>
                  <p className="home__muted home__muted--small">
                    Creating another profile will add a second tutor record (new
                    id). Use only if you intend to list multiple personas.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
