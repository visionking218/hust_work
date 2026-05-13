import { Tutor } from "../models/tutors.model";

export class TutorsService {
  async createTutor(tutorData: any) {
    const tutorId = tutorData.tutorId;
    if (typeof tutorId !== "string" || tutorId.length === 0) {
      throw new Error("tutorId is required");
    }
    const existingTutor = await Tutor.findOne({ tutorId: tutorData.tutorId });
    if (existingTutor) {
      return await Tutor.findOneAndUpdate({ tutorId: tutorData.tutorId }, tutorData, {
        new: true,
      });
    }
    const tutor = new Tutor({
        ...tutorData,
    });
    return await tutor.save();
  }

  async getTutorById(id: string) {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("id is required");
    }
    return await Tutor.findOne({ tutorId: id });
  }

  async listTutors() {
    return await Tutor.find({}).sort({ createdAt: -1 }).lean();
  }

  async updateTutor(id: string, tutorData: any) {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("id is required");
    }
    return await Tutor.findOneAndUpdate({ tutorId: id }, tutorData, {
      new: true,
    });
  }

  async deleteTutor(id: string) {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("id is required");
    }
    return await Tutor.findOneAndDelete({ tutorId: id });
  }
}