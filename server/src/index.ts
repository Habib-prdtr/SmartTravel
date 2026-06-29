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
import helmet from "helmet";
import compression from "compression";
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

// Set up rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window` (here, per 15 minutes)
  message: { message: "Terlalu banyak permintaan, silakan coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { message: "Terlalu banyak permintaan ke layanan ini, silakan coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 1. Keamanan Header HTTP
app.use(helmet());

// 2. Kompresi Payload Response
app.use(compression());

app.use(cors({
  origin: true, // Izinkan semua origin (Mobile App, Web, Ngrok, dll)
  credentials: true
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "smarttravel-api"
  });
});

// app.use("/api/auth", strictLimiter, authRoutes);
// app.use("/api/trips", generalLimiter, tripRoutes);
// app.use("/api/trips", generalLimiter, itineraryRoutes);
// app.use("/api/trips", generalLimiter, budgetRoutes);
// app.use("/api/ai", strictLimiter, aiRoutes);

// Rate limiting disabled for testing
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips", itineraryRoutes);
app.use("/api/trips", budgetRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, _req, res, _next) => {
  console.error("[Global Error]:", err);
  
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
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
