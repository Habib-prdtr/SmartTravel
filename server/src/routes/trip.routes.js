import { Router } from "express";
import { createTrip, deleteTrip, getTripById, getTripHistory, getTrips } from "../controllers/trip.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getTrips);
router.get("/history", getTripHistory);
router.post("/", createTrip);
router.get("/:tripId", getTripById);
router.delete("/:tripId", deleteTrip);

export default router;
