import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks";
import { getPaymentOrder } from "../../service/paymentService";
import "../auth-forms.css";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const { refreshCurrentUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "paid" | "pending" | "failed">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: number | undefined;
    let attempts = 0;
    setStatus("loading");
    setError(null);

    const checkStatus = async () => {
      try {
        const order = await getPaymentOrder(orderId);
        if (cancelled) return;
        setStatus(order.status === "paid" ? "paid" : order.status);
        if (order.status === "paid") {
          await refreshCurrentUser();
          return;
        }
        if (order.status === "pending" && attempts < 20) {
          attempts += 1;
          timer = window.setTimeout(() => {
            void checkStatus();
          }, 3000);
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("failed");
          setError(e instanceof Error ? e.message : "Failed to load payment status.");
        }
      }
    };

    void checkStatus();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId, refreshCurrentUser]);

  const message = useMemo(() => {
    if (!orderId) return "Missing orderId in URL.";
    if (status === "loading") return "Checking payment status...";
    if (status === "paid") return "Payment confirmed. Your account is marked as paid.";
    if (status === "pending") {
      return "Payment is still pending. Once Kaspi webhook reaches backend, this changes to paid.";
    }
    if (status === "failed") return "Payment check failed.";
    return "";
  }, [orderId, status]);

  return (
    <main className="auth-page">
      <h1 className="auth-page__title">Payment status</h1>
      <p className="auth-page__lead">
        Kaspi payment return page. Backend webhook is the source of truth.
      </p>
      <p>{message}</p>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {orderId ? (
        <p className="auth-page__lead">
          Order: <code>{orderId}</code>
        </p>
      ) : null}
      <p className="auth-sub">
        <Link to="/">Back to home</Link>
      </p>
    </main>
  );
}
