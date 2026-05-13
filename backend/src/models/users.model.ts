import mongoose from "mongoose";

export const USER_ROLES = ["student", "tutor"] as const;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    paidServices: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const o = ret as Record<string, unknown>;
        delete o.passwordHash;
        return o;
      },
    },
  },
);

export const User = mongoose.model("User", userSchema);
