import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { TutorsService } from "../services/tutors.services";

export class TutorsController {
    private tutorsService: TutorsService;

    constructor() {
        this.tutorsService = new TutorsService();
    }

    async createTutor(req: Request, res: Response) {
        try {
            const tutorId = randomUUID();
            const tutorData = { ...req.body, tutorId };
            const tutor = await this.tutorsService.createTutor(tutorData);
            res.status(201).json(tutor);
        } catch (error) {
            res.status(500).json({ message: "Failed to create tutor" });
        }
    }

    async listTutors(req: Request, res: Response) {
        try {
            const tutors = await this.tutorsService.listTutors();
            res.status(200).json(tutors);
        } catch (error) {
            res.status(500).json({ message: "Failed to list tutors", error: error });
        }
    }

    async getTutorById(req: Request, res: Response) {
        try {
            const id = req.params.id as string | undefined;
            if (!id) {
                return res.status(400).json({ message: "Tutor ID is required" });
            }
            const tutor = await this.tutorsService.getTutorById(id);
            if (!tutor) {
                return res.status(404).json({ message: "Tutor not found" });
            }
            res.status(200).json(tutor);
        } catch (error) {
            res.status(500).json({ message: "Failed to get tutor", error: error });
        }
    }   

    async updateTutor(req: Request, res: Response) {
        try {
            const id = req.params.id as string | undefined;
            if (!id) {
                return res.status(400).json({ message: "Tutor ID is required" });
            }
            const tutorData = req.body;
            const tutor = await this.tutorsService.updateTutor(id, tutorData);
            if (!tutor) {
                return res.status(404).json({ message: "Tutor not found" });
            }
            res.status(200).json(tutor);
        } catch (error) {
            res.status(500).json({ message: "Failed to update tutor", error: error });
        }
    }

    async deleteTutor(req: Request, res: Response) {
        try {
            const id = req.params.id as string | undefined;
            if (!id) {
                return res.status(400).json({ message: "Tutor ID is required" });
            }
            const result = await this.tutorsService.deleteTutor(id);
            if (!result) {
                return res.status(404).json({ message: "Tutor not found" });
            }
            res.status(200).json({ message: "Tutor deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete tutor", error: error });
        }
    }
}