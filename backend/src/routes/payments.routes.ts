import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";

const router = Router();
const paymentsController = new PaymentsController();

router.post("/create-order", (req, res) => void paymentsController.createOrder(req, res));
router.post("/kaspi/webhook", (req, res) => void paymentsController.kaspiWebhook(req, res));
router.get("/orders/:orderId", (req, res) => void paymentsController.getOrder(req, res));

export default router;
