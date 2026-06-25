// @ts-nocheck
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import itineraryRoutes from "./routes/itinerary.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "smarttravel-api"
  });
});

// Terapkan Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP setiap 15 menit
  message: { message: "Terlalu banyak request dari IP Anda, silakan coba lagi setelah 15 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Terapkan ke semua rute API
app.use("/api/", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips", itineraryRoutes);
app.use("/api/trips", budgetRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal server error"
  });
});

testDbConnection()
  .then(() => {
    console.log("MySQL connected");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MySQL:", err.message);
    process.exit(1);
  });
