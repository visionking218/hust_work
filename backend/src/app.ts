import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";

dotenv.config();

const app = express();

function corsOrigins(): string[] {
  const fromEnv = [
    process.env.FRONTEND_URL,
    process.env.VITE_FRONTEND_URL,
  ].filter((value): value is string => Boolean(value?.trim()));

  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    ...fromEnv,
  ];
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowed = corsOrigins();
      if (allowed.includes(origin)) {
        callback(null, true);
        return;
      }

      try {
        const { hostname } = new URL(origin);
        if (hostname.endsWith(".vercel.app")) {
          callback(null, true);
          return;
        }
      } catch {
        // invalid origin URL
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "src", "assets")),
);

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({ message: "Database unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/tutors", tutorRoutes);

app.get("/", (_req, res) => {
  res.send("Backend is running!");
});

export default app;
