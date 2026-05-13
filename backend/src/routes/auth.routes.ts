import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => void authController.register(req, res));
router.post("/login", (req, res) => void authController.login(req, res));
router.get("/me/:userId", (req, res) => void authController.getCurrentUser(req, res));

export default router;
