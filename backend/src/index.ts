import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import connectDB from "./config/database";
import authRoutes from "./routes/auth.routes";
import paymentsRoutes from "./routes/payments.routes";
import tutorRoutes from "./routes/tutor.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());
app.use(
  "/assets",
  express.static(path.join(process.cwd(), "src", "assets")),
);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/tutors", tutorRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 