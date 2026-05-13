import { useCallback, useState } from "react";
import type { Tutor } from "../@types";
import { createKaspiOrder } from "../service/paymentService";

type UseTutorPaymentInput = {
  studentUserId: string | null;
};

type UseTutorPaymentResult = {
  payBusy: boolean;
  payError: string | null;
  startKaspiPayment: (tutor: Tutor) => Promise<void>;
  clearPayError: () => void;
};

export function useTutorPayment({
  studentUserId,
}: UseTutorPaymentInput): UseTutorPaymentResult {
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const clearPayError = useCallback(() => setPayError(null), []);

  const startKaspiPayment = useCallback(
    async (tutor: Tutor) => {
      if (!studentUserId) {
        setPayError("Sign in as a student to pay.");
        return;
      }
      const amountRaw = tutor.contactUnlockFee ?? tutor.hourlyRate ?? 0;
      const amount = Number(amountRaw);
      if (!Number.isFinite(amount) || amount <= 0) {
        setPayError("This tutor does not have a valid payment amount.");
        return;
      }

      setPayError(null);
      setPayBusy(true);
      try {
        const returnUrl = `${window.location.origin}/payment-success`;
        const cancelUrl = `${window.location.origin}/`;
        const order = await createKaspiOrder({
          studentUserId,
          tutorId: tutor.tutorId,
          amount,
          returnUrl,
          cancelUrl,
        });

        window.location.href = order.paymentUrl;
      } catch (error) {
        setPayError(error instanceof Error ? error.message : "Payment start failed.");
      } finally {
        setPayBusy(false);
      }
    },
    [studentUserId],
  );

  return {
    payBusy,
    payError,
    startKaspiPayment,
    clearPayError,
  };
}
