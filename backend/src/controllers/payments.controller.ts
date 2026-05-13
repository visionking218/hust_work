import type { Request, Response } from "express";
import { PaymentsService } from "../services/payments.services";

function toSingleParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export class PaymentsController {
  private paymentsService: PaymentsService;

  constructor() {
    this.paymentsService = new PaymentsService();
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { studentUserId, tutorId, amount, returnUrl, cancelUrl } =
        req.body as Record<string, unknown>;
      if (
        typeof studentUserId !== "string" ||
        typeof tutorId !== "string" ||
        typeof amount !== "number" ||
        typeof returnUrl !== "string"
      ) {
        return res.status(400).json({
          message: "studentUserId, tutorId, amount, and returnUrl are required",
        });
      }
      if (amount <= 0) {
        return res.status(400).json({ message: "amount must be greater than 0" });
      }
      const order = await this.paymentsService.createOrder({
        studentUserId,
        tutorId,
        amount,
        returnUrl,
        cancelUrl: typeof cancelUrl === "string" ? cancelUrl : undefined,
      });
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === "student account not found") {
        return res.status(404).json({ message: error.message });
      }
      if (
        error instanceof Error &&
        error.message.startsWith("KASPI_PAYMENT_BASE_URL is not set")
      ) {
        return res.status(503).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create payment order" });
    }
  }

  async kaspiWebhook(req: Request, res: Response) {
    try {
      const { orderId, status } = req.body as Record<string, unknown>;
      if (typeof orderId !== "string" || typeof status !== "string") {
        return res.status(400).json({ message: "orderId and status are required" });
      }
      if (status !== "paid") {
        return res.status(202).json({ accepted: true, message: "Ignored non-paid status" });
      }
      const order = await this.paymentsService.markOrderPaid(orderId);
      return res.status(200).json({ ok: true, orderId: order.orderId, status: order.status });
    } catch (error) {
      if (error instanceof Error && error.message === "order not found") {
        return res.status(404).json({ message: "order not found" });
      }
      return res.status(500).json({ message: "Failed to process Kaspi webhook" });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const orderId = toSingleParam(req.params.orderId);
      const order = await this.paymentsService.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "order not found" });
      }
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === "orderId is required") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  }
}
