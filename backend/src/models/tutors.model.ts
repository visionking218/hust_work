import mongoose from "mongoose";

/**
 * Tutor profile for marketplace listing. Contact details after payment belong in bookings/messages flows.
 */
const tutorSchema = new mongoose.Schema(
  {
    tutorId: {
      type: String,
      required: true,
      unique: true,
    },
    tutorEmail: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    headline: {
      type: String,
      maxlength: 280,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    mainSkills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    yearsExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    /** Shown on profile; optional until you wire payments. */
    hourlyRate: {
      type: Number,
      min: 0,
    },
    /** Platform fee (same currency unit as hourlyRate) to unlock contact — implement checkout separately. */
    contactUnlockFee: {
      type: Number,
      min: 0,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
    /** Accepting new paid contact requests */
    acceptingContacts: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  },
);

export const Tutor = mongoose.model("Tutor", tutorSchema);
