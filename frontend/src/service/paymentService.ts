import { getApiBase } from "../lib/apiBase";

export type CreateKaspiOrderPayload = {
  studentUserId: string;
  tutorId: string;
  amount: number;
  returnUrl: string;
  cancelUrl?: string;
};

export type CreateKaspiOrderResponse = {
  orderId: string;
  paymentUrl: string;
  status: "pending" | "paid" | "failed";
  amount: number;
  currency: string;
};

export type PaymentOrder = {
  orderId: string;
  studentUserId: string;
  tutorId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  paidAt?: string;
};

async function readApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text) as { message?: string };
    if (typeof parsed.message === "string" && parsed.message.length > 0) {
      return parsed.message;
    }
  } catch {
    /* ignore */
  }
  return text || res.statusText || "Request failed";
}

export async function createKaspiOrder(
  payload: CreateKaspiOrderPayload,
): Promise<CreateKaspiOrderResponse> {
  const res = await fetch(`${getApiBase()}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  return res.json() as Promise<CreateKaspiOrderResponse>;
}

export async function getPaymentOrder(orderId: string): Promise<PaymentOrder> {
  const res = await fetch(
    `${getApiBase()}/api/payments/orders/${encodeURIComponent(orderId)}`,
  );
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  return res.json() as Promise<PaymentOrder>;
}
