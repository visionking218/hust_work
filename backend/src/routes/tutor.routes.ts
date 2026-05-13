import { Router } from "express";

import { TutorsController } from "../controllers/tutors.controller";
const router = Router();
const tutorsController = new TutorsController();

router.get("/", (req, res) => void tutorsController.listTutors(req, res));
router.post("/create", (req, res) => void tutorsController.createTutor(req, res));
router.get("/get/:id", (req, res) => void tutorsController.getTutorById(req, res));
router.put("/update/:id", (req, res) => void tutorsController.updateTutor(req, res));
router.delete("/delete/:id", (req, res) => void tutorsController.deleteTutor(req, res));

export default router;