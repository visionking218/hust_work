import { randomUUID } from "node:crypto";
import { PaymentOrder } from "../models/payments.model";
import { User } from "../models/users.model";

type CreateOrderInput = {
  studentUserId: string;
  tutorId: string;
  amount: number;
  returnUrl: string;
  cancelUrl?: string | undefined;
};

export class PaymentsService {
  async createOrder(input: CreateOrderInput) {
    const orderId = randomUUID();
    const studentUser = await User.findById(input.studentUserId).lean<{
      _id: unknown;
      role: string;
    } | null>();
    if (!studentUser || studentUser.role !== "student") {
      throw new Error("student account not found");
    }

    const order = await PaymentOrder.create({
      orderId,
      studentUserId: input.studentUserId,
      tutorId: input.tutorId,
      amount: input.amount,
      currency: "KZT",
      provider: "kaspi",
      status: "pending",
      providerInvoiceId: orderId,
    });

    /**
     * Kaspi does not provide a generic browser URL like https://kaspi.kz/pay?invoiceId=...
     * Merchants get a real checkout link from Kaspi Pay / Kaspi Bank APIs or a PSP
     * (e.g. invoice create response). Set KASPI_PAYMENT_BASE_URL to that base or full
     * template per your provider’s docs — never rely on an undocumented kaspi.kz path.
     */
    const kaspiBase = process.env.KASPI_PAYMENT_BASE_URL?.trim();
    if (!kaspiBase) {
      throw new Error(
        "KASPI_PAYMENT_BASE_URL is not set. Configure the checkout URL from your Kaspi Pay / bank or PSP integration; https://kaspi.kz/pay is not a valid merchant entry point.",
      );
    }
    const successUrl = `${input.returnUrl}?orderId=${encodeURIComponent(orderId)}`;
    const failUrl = input.cancelUrl ?? input.returnUrl;
    const paymentUrl =
      `${kaspiBase}` +
      `?invoiceId=${encodeURIComponent(orderId)}` +
      `&amount=${encodeURIComponent(String(input.amount))}` +
      `&successUrl=${encodeURIComponent(successUrl)}` +
      `&failUrl=${encodeURIComponent(failUrl)}`;

    return {
      orderId,
      paymentUrl,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
    };
  }

  async getOrder(orderId: string) {
    if (!orderId?.trim()) throw new Error("orderId is required");
    return PaymentOrder.findOne({ orderId }).lean();
  }

  async markOrderPaid(orderId: string) {
    if (!orderId?.trim()) throw new Error("orderId is required");
    const order = await PaymentOrder.findOneAndUpdate(
      { orderId },
      {
        status: "paid",
        paidAt: new Date(),
      },
      { new: true },
    ).lean();

    if (!order) {
      throw new Error("order not found");
    }

    await User.findByIdAndUpdate(order.studentUserId, { ispaid: true });
    return order;
  }
}
